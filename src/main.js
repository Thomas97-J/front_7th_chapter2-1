import { router } from "./router/index.js";
import { CartModal } from "./components/CartModal.js";
import { showToast } from "./components/Toast.js";
import {
  getCartItems,
  getSelectedItems,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  toggleSelectItem,
  toggleSelectAll,
  removeSelectedItems,
  subscribeCart,
} from "./utils/cartStore.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// 장바구니 모달 표시
function showCartModal() {
  const cartItems = getCartItems();
  const selectedItems = getSelectedItems();
  const modalHTML = CartModal({ cartItems, selectedItems });

  // 모달 컨테이너 생성 또는 가져오기
  const $root = document.querySelector("#root");
  let modalContainer = document.getElementById("cart-modal-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "cart-modal-container";
    $root.appendChild(modalContainer);
  }

  modalContainer.innerHTML = modalHTML;
  modalContainer.style.display = "block";
  document.body.style.overflow = "hidden"; // 스크롤 방지
}

// 장바구니 모달 숨기기
function hideCartModal() {
  const modalContainer = document.getElementById("cart-modal-container");
  if (modalContainer) {
    modalContainer.style.display = "none";
    document.body.style.overflow = ""; // 스크롤 복원
  }
}

// 장바구니 모달 다시 렌더링
function rerenderCartModal() {
  const modalContainer = document.getElementById("cart-modal-container");
  if (modalContainer && modalContainer.style.display !== "none") {
    const cartItems = getCartItems();
    const selectedItems = getSelectedItems();
    modalContainer.innerHTML = CartModal({ cartItems, selectedItems });
  }
}

// 이벤트 리스너
const initEventListeners = () => {
  const $root = document.querySelector("#root");

  // 장바구니 변경 구독
  subscribeCart(() => {
    rerenderCartModal();
    router.rerender(); // Header의 장바구니 개수 업데이트
  });

  $root.addEventListener("click", (e) => {
    // 장바구니 아이콘 클릭
    if (e.target.closest("#cart-icon-btn")) {
      e.preventDefault();
      showCartModal();
      return;
    }

    // 장바구니 모달 닫기
    if (e.target.closest("#cart-modal-close-btn")) {
      hideCartModal();
      return;
    }

    // 모달 배경 클릭 시 닫기
    if (e.target.closest("#cart-modal-container") && e.target.id === "cart-modal-container") {
      hideCartModal();
      return;
    }

    // 전체 선택
    if (e.target.closest("#cart-modal-select-all-checkbox")) {
      const checkbox = e.target.closest("#cart-modal-select-all-checkbox");
      toggleSelectAll(checkbox.checked);
      return;
    }

    // 개별 체크박스
    if (e.target.classList.contains("cart-item-checkbox")) {
      toggleSelectItem(e.target.dataset.productId, e.target.checked);
      return;
    }

    // 수량 증가
    const increaseBtn = e.target.closest(".quantity-increase-btn");
    if (increaseBtn) {
      increaseQuantity(increaseBtn.dataset.productId);
      return;
    }

    // 수량 감소
    const decreaseBtn = e.target.closest(".quantity-decrease-btn");
    if (decreaseBtn) {
      decreaseQuantity(decreaseBtn.dataset.productId);
      return;
    }

    // 아이템 삭제
    if (e.target.classList.contains("cart-item-remove-btn")) {
      removeFromCart(e.target.dataset.productId);
      return;
    }

    // 선택한 상품 삭제
    if (e.target.closest("#cart-modal-remove-selected-btn")) {
      if (confirm("선택한 상품을 삭제하시겠습니까?")) {
        removeSelectedItems();
        showToast("선택한 상품이 삭제되었습니다", "info");
      }
      return;
    }

    // 전체 비우기
    if (e.target.closest("#cart-modal-clear-cart-btn")) {
      if (confirm("장바구니를 비우시겠습니까?")) {
        clearCart();
        showToast("장바구니가 비워졌습니다", "info");
      }
      return;
    }

    // 구매하기
    if (e.target.closest("#cart-modal-checkout-btn")) {
      showToast("구매 기능은 준비중입니다!", "info");
      return;
    }

    // 장바구니 담기 버튼
    if (e.target.closest(".add-to-cart-btn")) {
      e.preventDefault();
      e.stopPropagation();

      const btn = e.target.closest(".add-to-cart-btn");
      const productId = btn.dataset.productId;
      const productCard = btn.closest(".product-card");
      const productName = productCard.querySelector("h3").textContent;
      const productPrice = parseInt(productCard.querySelector("p:last-of-type").textContent.replace(/[^0-9]/g, ""));
      const productImage = productCard.querySelector("img").src;

      addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
      });

      showToast("장바구니에 추가되었습니다", "success");
      return;
    }

    // 상품 카드 클릭 (장바구니 담기 버튼 제외)
    if (e.target.closest(".product-card") && !e.target.closest(".add-to-cart-btn")) {
      e.preventDefault();
      const productId = e.target.closest(".product-card").dataset.productId;
      router.push(`/products/${productId}`);
      return;
    }

    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      router.push(href);
      return;
    }

    // 1depth 카테고리 클릭
    const category1Btn = e.target.closest(".category1-btn");
    if (category1Btn) {
      const category1 = category1Btn.dataset.category1;
      const currentParams = router.getQueryParams();

      router.pushWithQuery("/", {
        ...currentParams,
        category1,
        category2: "",
        current: 1,
      });
    }

    // 전체 리셋 (기존 버튼)
    if (e.target.closest("#category-reset-btn")) {
      const currentParams = router.getQueryParams();

      router.pushWithQuery("/", {
        ...currentParams,
        category1: "",
        category2: "",
        current: 1,
      });
    }

    // 브레드크럼 - 전체 리셋
    const resetBtn = e.target.closest('[data-breadcrumb="reset"]');
    if (resetBtn) {
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        category1: "",
        category2: "",
        current: 1,
      });
    }

    // 브레드크럼 - category1으로 돌아가기
    const category1Breadcrumb = e.target.closest('[data-breadcrumb="category1"]');
    if (category1Breadcrumb) {
      const category1 = category1Breadcrumb.dataset.category1;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        category1,
        category2: "",
        current: 1,
      });
    }

    // 2depth 카테고리 클릭
    const category2Btn = e.target.closest(".category2-filter-btn");
    if (category2Btn) {
      const category1 = category2Btn.dataset.category1;
      const category2 = category2Btn.dataset.category2;
      const currentParams = router.getQueryParams();

      router.pushWithQuery("/", {
        ...currentParams,
        category1,
        category2,
        current: 1,
      });
    }

    // 상세 페이지 - 수량 증가
    if (e.target.closest("#quantity-increase")) {
      const input = document.getElementById("quantity-input");
      if (input) {
        const currentValue = parseInt(input.value) || 1;
        const max = parseInt(input.getAttribute("max")) || 999;
        if (currentValue < max) {
          input.value = currentValue + 1;
        }
      }
      return;
    }

    // 상세 페이지 - 수량 감소
    if (e.target.closest("#quantity-decrease")) {
      const input = document.getElementById("quantity-input");
      if (input) {
        const currentValue = parseInt(input.value) || 1;
        const min = parseInt(input.getAttribute("min")) || 1;
        if (currentValue > min) {
          input.value = currentValue - 1;
        }
      }
      return;
    }

    // 상세 페이지 - 장바구니 담기
    if (e.target.closest("#add-to-cart-btn")) {
      const btn = e.target.closest("#add-to-cart-btn");
      const productId = btn.dataset.productId;

      // 상세 페이지에서 상품 정보 가져오기
      const productTitle = document.querySelector("h1").textContent;
      const productPrice = parseInt(
        document.querySelector(".text-2xl.font-bold.text-blue-600").textContent.replace(/[^0-9]/g, ""),
      );
      const productImage = document.querySelector(".product-detail-image").src;
      const quantity = parseInt(document.getElementById("quantity-input").value) || 1;

      // 수량만큼 추가
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: productId,
          name: productTitle,
          price: productPrice,
          image: productImage,
        });
      }

      showToast(`${quantity}개 상품이 장바구니에 추가되었습니다`, "success");
      return;
    }

    // 상세 페이지 - 상품 목록으로 돌아가기
    if (e.target.closest(".go-to-product-list")) {
      router.push("/");
      return;
    }

    // 상세 페이지 - 관련 상품 클릭
    if (e.target.closest(".related-product-card")) {
      const card = e.target.closest(".related-product-card");
      const productId = card.dataset.productId;
      router.push(`/products/${productId}`);
      return;
    }

    // 상세 페이지 - 브레드크럼 카테고리 클릭
    if (e.target.closest(".breadcrumb-link")) {
      const link = e.target.closest(".breadcrumb-link");
      const category1 = link.dataset.category1;
      const category2 = link.dataset.category2;

      if (category2) {
        router.pushWithQuery("/", { category1, category2, current: 1 });
      } else if (category1) {
        router.pushWithQuery("/", { category1, current: 1 });
      }
      return;
    }
  });

  $root.addEventListener("change", (e) => {
    // limit 변경
    if (e.target.closest("#limit-select")) {
      const limit = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        limit,
        current: 1,
      });
    }

    // sort 변경
    if (e.target.closest("#sort-select")) {
      const sort = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        sort,
        current: 1,
      });
    }
  });

  // 검색어 입력 (엔터키)
  $root.addEventListener("keypress", (e) => {
    if (e.target.closest("#search-input") && e.key === "Enter") {
      const search = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        search,
        current: 1,
      });
    }
  });
};

const main = () => {
  initEventListeners();
  router.init();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
