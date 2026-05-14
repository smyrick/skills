namespace reviews

let &api = http::Service {
  # This variable automatically resolves to the config.url of the dependency
  baseUrl = env::__DEPENDENCY_URL__REVIEWS
}

"Get reviews for a product from REST API"
op getProductReviews($productId: ID) {
  return &api::get(path = "/products/{ $productId }/reviews")
}
