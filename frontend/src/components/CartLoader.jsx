import { ShoppingCart, Package } from 'lucide-react'

function CartLoader({ text = "Loading..." }) {
  return (
    <div className="cart-loader-wrapper panel">
      <div className="cart-animation-container">
        <div className="falling-item">
          <Package size={24} className="item-icon" />
        </div>
        <div className="moving-cart">
          <ShoppingCart size={40} className="cart-icon" />
        </div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  )
}

export default CartLoader
