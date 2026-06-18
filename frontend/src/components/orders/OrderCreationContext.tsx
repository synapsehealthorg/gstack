"use client"

import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { OrderProduct, TechpackPage } from "@/lib/db"

interface OrderPricingData {
  targetUnitPrice?: number
  turnaroundTime?: string
  shippingAddressId?: string
}

export interface OrderCreationState {
  currentStep: number
  role: 'sourcing' | 'selling' | null
  products: OrderProduct[]
  techpackData: Record<string, TechpackPage[]> // Keyed by product ID
  inspirationFiles: any[]
  splitBidding: boolean
  visibility: 'exchange' | 'private'
  pricingData: OrderPricingData
  isValid: boolean
}

type OrderCreationAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_ROLE'; payload: 'sourcing' | 'selling' }
  | { type: 'ADD_PRODUCT'; payload: OrderProduct }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: OrderProduct }
  | { type: 'SET_TECHPACK_PAGE'; payload: { productId: string, page: TechpackPage } }
  | { type: 'ADD_INSPIRATION_FILE'; payload: any }
  | { type: 'SET_SPLIT_BIDDING'; payload: boolean }
  | { type: 'SET_VISIBILITY'; payload: 'exchange' | 'private' }
  | { type: 'UPDATE_PRICING'; payload: Partial<OrderPricingData> }
  | { type: 'SET_IS_VALID'; payload: boolean }

const initialState: OrderCreationState = {
  currentStep: 1,
  role: null,
  products: [],
  techpackData: {},
  inspirationFiles: [],
  splitBidding: false,
  visibility: 'exchange',
  pricingData: {},
  isValid: false
}

function orderCreationReducer(state: OrderCreationState, action: OrderCreationAction): OrderCreationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_ROLE':
      return { ...state, role: action.payload }
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, action.payload],
        techpackData: { ...state.techpackData, [action.payload.id]: [] }
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
