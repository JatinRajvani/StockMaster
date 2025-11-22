import { ReceiptModel } from "../models/receiptModel.js";
import { StockModel } from "../models/stockModel.js"; // uses the stock model you already have
import { ObjectId } from "mongodb";

/*
 Receipt document recommended structure:
 {
   receiptId: "RC001",
   supplierId: "SUP001",
   warehouseId: "WH001",
   status: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled",
   items: [
     {
       productId: "PR001",
       orderedQty: 100,
       receivedQty: 0,        // set when receiving
       locationId: "LOC001"   // optional, set only when receiving
     }
   ],
   createdAt, updatedAt
 }
*/

// ---------- Helper: generate next RC### ----------
async function generateNextReceiptId() {
  const all = await ReceiptModel.getAllReceipts();
  const nextNumber = all.length + 1;
  return `RC${String(nextNumber).padStart(3, "0")}`;
}

// ---------- Helper: generate next ST### (for auto-creating stock) ----------
async function generateNextStockId() {
  const all = await StockModel.getAllStock();
  const nextNumber = all.length + 1;
  return `ST${String(nextNumber).padStart(3, "0")}`;
}


// CREATE RECEIPT (Draft)
export const createReceipt = async (req, res) => {
  try {
    const { supplierId, warehouseId, items } = req.body;

    if (!supplierId || !warehouseId || !Array.isArray(items)) {
      return res.status(400).json({ message: "supplierId, warehouseId and items[] are required" });
    }

    const receiptId = await generateNextReceiptId();

    const receipt = {
      receiptId,
      supplierId,
      warehouseId,
      status: "Draft",
      items: items.map(it => ({
        productId: it.productId,
        orderedQty: it.orderedQty || 0,
        receivedQty: 0
        // locationId intentionally omitted at creation
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await ReceiptModel.createReceipt(receipt);

    res.json({
      message: "Receipt created successfully",
      receipt: {
        _id: result.insertedId,
        ...receipt
      }
    });
  } catch (error) {
    console.error("createReceipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL RECEIPTS
export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await ReceiptModel.getAllReceipts();
    res.json({ message: "Fetched successfully", receipts });
  } catch (error) {
    console.error("getAllReceipts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET RECEIPT BY ID (receiptId like RC001)
export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await ReceiptModel.findByReceiptId(id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json({ message: "Fetched successfully", receipt });
  } catch (error) {
    console.error("getReceiptById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE RECEIPT (edit draft items / supplier etc.)
export const updateReceipt = async (req, res) => {
  try {
    const { id } = req.params; // RC001
    const updates = req.body;

    const result = await ReceiptModel.updateReceipt(id, updates);

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.json({ message: "Receipt updated successfully" });
  } catch (error) {
    console.error("updateReceipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE RECEIPT (only drafts or non-done receipts ideally)
export const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ReceiptModel.deleteReceipt(id);
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error("deleteReceipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  receiveGoods:
  - Accepts items array with productId, receivedQty and optional locationId
  - Updates corresponding items in receipt with receivedQty and locationId
  - Changes status to "Waiting" or "Ready" (Ready if all receivedQty >= orderedQty)
*/
export const receiveGoods = async (req, res) => {
  try {
    const { id } = req.params; // receiptId RC001
    const { items } = req.body; // [{ productId, receivedQty, locationId }]

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items[] is required" });
    }

    const receipt = await ReceiptModel.findByReceiptId(id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    // map incoming items for quick lookup
    const incomingMap = {};
    for (const it of items) {
      if (!it.productId) continue;
      incomingMap[it.productId] = {
        receivedQty: Number(it.receivedQty || 0),
        locationId: it.locationId || null
      };
    }

    // update receipt.items
    let allReceivedOrOver = true;
    const updatedItems = receipt.items.map(it => {
      const inc = incomingMap[it.productId];
      if (!inc) {
        allReceivedOrOver = false; // if there's an item not provided, we consider not fully received
        return it;
      }
      const newReceived = (it.receivedQty || 0) + inc.receivedQty;
      const updated = {
        ...it,
        receivedQty: newReceived
      };
      // set locationId only when receiving
      if (inc.locationId) updated.locationId = inc.locationId;
      // if still less than ordered, not fully received
      if (newReceived < (it.orderedQty || 0)) allReceivedOrOver = false;
      return updated;
    });

    const newStatus = allReceivedOrOver ? "Ready" : "Waiting";

    await ReceiptModel.updateReceipt(id, { items: updatedItems, status: newStatus });

    res.json({ message: "Received quantities updated", status: newStatus, items: updatedItems });
  } catch (error) {
    console.error("receiveGoods error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  validateReceipt:
  - Finalizes the receipt and updates stock.
  - For each item, uses receivedQty. If stock record doesn't exist for (productId, warehouseId, locationId)
    it auto-creates a stock entry (with next ST###) and sets quantity = receivedQty, otherwise increases existing qty.
  - Sets receipt.status = "Done"
*/
export const validateReceipt = async (req, res) => {
  try {
    const { id } = req.params; // RC001

    const receipt = await ReceiptModel.findByReceiptId(id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    // Only allow validation if status is Ready or Waiting (you may customize rule)
    if (receipt.status === "Done") {
      return res.status(400).json({ message: "Receipt already validated" });
    }

    // For each item, ensure receivedQty > 0 and locationId exists (if not provided, assume default location of warehouse)
    for (const it of receipt.items) {
      const qty = Number(it.receivedQty || 0);
      if (qty <= 0) {
        // skip zero received qty items
        continue;
      }

      // location: if item has locationId set during receiveGoods, use it, else null/empty
      const locationId = it.locationId || null;
      const { productId } = it;
      const warehouseId = receipt.warehouseId;

      // find existing stock record for product+warehouse+location
      let stockRecord = await StockModel.findStockRecord(productId, warehouseId, locationId);

      if (!stockRecord) {
        // auto-create stock record (per your rule)
        const newStockId = await generateNextStockId();
        const createObj = {
          stockId: newStockId,
          productId,
          warehouseId,
          locationId,
          quantity: qty,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await StockModel.createStock(createObj);
        // optional: push created info somewhere or log
      } else {
        // existing => increase quantity
        const newQty = Number(stockRecord.quantity || 0) + qty;
        await StockModel.updateStock(stockRecord.stockId, { quantity: newQty });
      }
    }

    // mark receipt as Done
    await ReceiptModel.updateReceipt(id, { status: "Done" });

    res.json({ message: "Receipt validated and stock updated", receiptId: id });
  } catch (error) {
    console.error("validateReceipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel receipt
export const cancelReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await ReceiptModel.findByReceiptId(id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    if (receipt.status === "Done") {
      return res.status(400).json({ message: "Cannot cancel a validated receipt. Use stock adjustment." });
    }

    await ReceiptModel.updateReceipt(id, { status: "Canceled" });
    res.json({ message: "Receipt canceled" });
  } catch (error) {
    console.error("cancelReceipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
