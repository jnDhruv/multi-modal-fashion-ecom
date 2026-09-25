import { useState } from 'react'
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Category from "./pages/Category"
import './App.css'

function App() {


  return (
    <>
      <Routes>
        <Route index element = {<Home/>} ></Route>
        <Route path='products' element= {<Products/>}></Route>
        <Route path="/category/:categoryName" element={<Category />} />
      </Routes>
    </>
  )
}

export default App
