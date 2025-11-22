import { WarehouseModel } from "../models/warehouseModel.js";

// CREATE WAREHOUSE
export const createWarehouse = async (req, res) => {
  try {
    const { warehouseId, name, address } = req.body;

    const warehouse = {
      warehouseId,
      name,
      address,
      createdAt: new Date(),
    };

    await WarehouseModel.createWarehouse(warehouse);

    res.json({
      message: "Warehouse created successfully",
      warehouse,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL WAREHOUSES
export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await WarehouseModel.getAllWarehouses();

    res.json({
      message: "Fetched successfully",
      warehouses,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET SINGLE BY ID
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await WarehouseModel.findById(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.json({
      message: "Fetched successfully",
      warehouse,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
