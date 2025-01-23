import { configureStore } from "@reduxjs/toolkit"
import concoursReducer from "./slices/concoursSlice"

const store = configureStore({
  reducer: {
    concours: concoursReducer,
  },
})

export default store

