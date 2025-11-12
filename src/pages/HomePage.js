import { getCategories, getProducts } from "../api/productApi.js";
import { SearchForm } from "../components/SearchForm.js";
import { ProductList } from "../components/ProductList.js";
import { router } from "../router/index.js";
import { useState, useEffect, setCurrentComponent } from "../utils/hooks.js";

export const HomePage = () => {
  setCurrentComponent("HomePage");

  // ✅ 상태 관리
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // 쿼리 파라미터
  const queryParams = router.getQueryParams();
  const filters = {
    current: parseInt(queryParams.current) || 1, // ✅ page → current
    limit: parseInt(queryParams.limit) || 20,
    search: queryParams.search || "",
    category1: queryParams.category1 || "",
    category2: queryParams.category2 || "",
    sort: queryParams.sort || "price_asc",
  };

  // ✅ useEffect: 필터 변경 시 상품 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts(filters);
        setProducts(data.products);
        setPagination(data.pagination);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.current, filters.limit, filters.search, filters.category1, filters.category2, filters.sort]);

  // ✅ useEffect: 카테고리 로드 (최초 한 번만)
  useEffect(() => {
    const fetchCategories = async () => {
      if (categoriesFetched) return;

      setCategoriesLoading(true);

      try {
        const data = await getCategories();
        setCategories(data);
        setCategoriesLoading(false);
        setCategoriesFetched(true);
      } catch (error) {
        console.error(error);
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return /* html */ `
    ${SearchForm({
      categoriesLoading,
      categories,
      filters,
      pagination,
    })}
    ${ProductList({
      loading,
      products,
      pagination,
    })}
  `;
};
