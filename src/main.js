import { router } from "./router/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// 이벤트 리스너
const initEventListeners = () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".product-card")) {
      e.preventDefault();
      const productId = e.target.closest(".product-card").dataset.productId;
      router.push(`/products/${productId}`);
    }

    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      router.push(href);
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
    if (e.target.id === "category-reset-btn") {
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
  });

  document.body.addEventListener("change", (e) => {
    // limit 변경
    if (e.target.id === "limit-select") {
      const limit = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        limit,
        current: 1,
      });
    }

    // sort 변경
    if (e.target.id === "sort-select") {
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
  document.body.addEventListener("keypress", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
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
