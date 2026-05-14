namespace products

let &api = graphql::Service {
  # This variable automatically resolves to the config.url of the dependency
  url = env::__DEPENDENCY_URL__PRODUCTS
}

import schema from &api

"List all products"
op listProducts() {
  return query using &api {
    products { id name price }
  }.products
}

"Get reviews for a product"
op listReviews($productId: ID) {
  return query using &api {
    reviews(productId = $productId) { id productId rating body }
  }.reviews
}
