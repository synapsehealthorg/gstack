"use client"

import React, { createContext, useContext, useEffect, useReducer, useRef, ReactNode } from "react"
import { OrderLogistics, OrderProduct, PublishVisibility, TechpackPage } from "@/lib/db"

interface OrderPricingData {
  targetUnitPrice?: number
  turnaroundTime?: string
  shippingAddressId?: string
}

export interface OrderCreationState {
  currentStep: number
  screen: 'canvas' | 'logistics'
  orderName: string
  role: 'sourcing' | 'selling' | null
  products: OrderProduct[]
  techpackData: Record<string, TechpackPage[]> // Keyed by product ID
  inspirationFiles: unknown[]
  splitBidding: boolean
  visibility: PublishVisibility
  logistics: OrderLogistics
  pricingData: OrderPricingData
  isValid: boolean
}

type OrderCreationAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_SCREEN'; payload: 'canvas' | 'logistics' }
  | { type: 'SET_ORDER_NAME'; payload: string }
  | { type: 'SET_ROLE'; payload: 'sourcing' | 'selling' }
  | { type: 'ADD_PRODUCT'; payload: OrderProduct }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: OrderProduct }
  | { type: 'SET_TECHPACK_PAGE'; payload: { productId: string, page: TechpackPage } }
  | { type: 'ADD_INSPIRATION_FILE'; payload: unknown }
  | { type: 'SET_SPLIT_BIDDING'; payload: boolean }
  | { type: 'SET_VISIBILITY'; payload: PublishVisibility }
  | { type: 'UPDATE_LOGISTICS'; payload: Partial<OrderLogistics> }
  | { type: 'UPDATE_PRICING'; payload: Partial<OrderPricingData> }
  | { type: 'SET_IS_VALID'; payload: boolean }

const initialState: OrderCreationState = {
  currentStep: 1,
  screen: 'canvas',
  orderName: "Untitled production order",
  role: null,
  products: [],
  techpackData: {},
  inspirationFiles: [],
  splitBidding: false,
  visibility: 'market',
  logistics: {
    tatDays: 21,
    sampleRequired: true,
    sampleTatDays: 5,
    incoterms: 'FOB',
  },
  pricingData: {},
  isValid: false
}

function orderCreationReducer(state: OrderCreationState, action: OrderCreationAction): OrderCreationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }
    case 'SET_ORDER_NAME':
      return { ...state, orderName: action.payload }
    case 'SET_ROLE':
      return { ...state, role: action.payload }
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, action.payload],
        techpackData: { ...state.techpackData, [action.payload.id]: action.payload.techpack_pages || [] }
      }
    case 'REMOVE_PRODUCT':
      const newProducts = state.products.filter(p => p.id !== action.payload)
      const newTechpackData = { ...state.techpackData }
      delete newTechpackData[action.payload]
      return { ...state, products: newProducts, techpackData: newTechpackData }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      }
    case 'SET_TECHPACK_PAGE':
      const { productId, page } = action.payload
      const existingPages = state.techpackData[productId] || []
      const pageIndex = existingPages.findIndex(p => p.page_type === page.page_type)
      let newPages
      if (pageIndex >= 0) {
        newPages = [...existingPages]
        newPages[pageIndex] = page
      } else {
        newPages = [...existingPages, page]
      }
      return {
        ...state,
        techpackData: { ...state.techpackData, [productId]: newPages }
      }
    case 'ADD_INSPIRATION_FILE':
      return { ...state, inspirationFiles: [...state.inspirationFiles, action.payload] }
    case 'SET_SPLIT_BIDDING':
      return { ...state, splitBidding: action.payload }
    case 'SET_VISIBILITY':
      return { ...state, visibility: action.payload }
    case 'UPDATE_LOGISTICS':
      return { ...state, logistics: { ...state.logistics, ...action.payload } }
    case 'UPDATE_PRICING':
      return { ...state, pricingData: { ...state.pricingData, ...action.payload } }
    case 'SET_IS_VALID':
      return { ...state, isValid: action.payload }
    default:
      return state
  }
}

const OrderCreationContext = createContext<{
  state: OrderCreationState
  dispatch: React.Dispatch<OrderCreationAction>
} | undefined>(undefined)

export function OrderCreationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderCreationReducer, initialState)
  const importedRef = useRef(false)

  useEffect(() => {
    if (importedRef.current) return
    importedRef.current = true
    const raw = window.sessionStorage.getItem("proov_order_product_prefill")
    if (!raw) return
    try {
      const product = JSON.parse(raw) as OrderProduct
      dispatch({ type: 'ADD_PRODUCT', payload: product })
      dispatch({ type: 'SET_ORDER_NAME', payload: `${product.name} production order` })
      window.sessionStorage.removeItem("proov_order_product_prefill")
    } catch {
      window.sessionStorage.removeItem("proov_order_product_prefill")
    }
  }, [])
  
  return (
    <OrderCreationContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderCreationContext.Provider>
  )
}

export function useOrderCreation() {
  const context = useContext(OrderCreationContext)
  if (context === undefined) {
    throw new Error('useOrderCreation must be used within an OrderCreationProvider')
  }
  return context
}
