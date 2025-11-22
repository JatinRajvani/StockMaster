import React from 'react'

// Minimal shim for react-query hooks used across the pages.
export function useQuery({ queryKey, queryFn }){
  const [data, setData] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(()=>{
    let mounted = true
    Promise.resolve(queryFn()).then((d)=>{
      if(mounted){ setData(d); setIsLoading(false) }
    }).catch(()=>{ if(mounted) setIsLoading(false) })
    return ()=>{ mounted = false }
  }, [JSON.stringify(queryKey)])

  return { data, isLoading }
}

export function useMutation({ mutationFn, onSuccess }){
  return {
    mutate: (vars) => Promise.resolve(mutationFn(vars)).then((res)=>{ onSuccess?.(); return res })
  }
}

export function useQueryClient(){
  return { invalidateQueries: ()=>{} }
}

export default { useQuery, useMutation, useQueryClient }
