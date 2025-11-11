import { getProduct } from "../api/productApi.js";
import { ProductDetail } from "../components/ProductDetail.js";
import { router } from "../router/index.js";

// 상태 관리 객체
const state = {
  product: null,
  loading: true,
  productId: null,

  update(newState) {
    console.log("update", newState);
    Object.assign(this, newState);
    router.rerender();
  },

  async fetchProduct() {
    this.loading = true;
    router.rerender();

    try {
      const data = await getProduct(this.productId);
      console.log(data);
      this.update({
        product: data,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      this.update({ loading: false });
    }
  },
};

export const DetailPage = (params) => {
  const productId = params.id;

  if (state.productId !== productId) {
    state.productId = productId;
    state.fetchProduct();
  }

  return ProductDetail({ loading: state.loading, product: state.product });
};
