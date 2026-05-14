"List products with their reviews (cross-source join)"
@tool op JoinedProducts() {
  let $products = products::listProducts()
  return $products -> {
    id: ID
    name: String
    price: Float
    reviews = reviews::getProductReviews(productId = .id)
  }
}
