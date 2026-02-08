import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/cart";

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it("should add an item to cart", () => {
    const { addItem } = useCartStore.getState();

    addItem({
      id: "1",
      name: "Test Product",
      price: 100000,
      image: "/test.jpg",
      stock: 10,
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.isOpen).toBe(true);
  });

  it("should increment quantity for existing item", () => {
    const store = useCartStore.getState();

    store.addItem({
      id: "1",
      name: "Test Product",
      price: 100000,
      image: "/test.jpg",
      stock: 10,
    });

    store.addItem({
      id: "1",
      name: "Test Product",
      price: 100000,
      image: "/test.jpg",
      stock: 10,
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("should not exceed stock when adding items", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 2 });
    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 2 });
    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 2 });

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(2);
  });

  it("should not add out-of-stock items", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 0 });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should calculate total correctly", () => {
    const store = useCartStore.getState();

    store.addItem({
      id: "1",
      name: "Product 1",
      price: 100000,
      image: "",
      stock: 10,
    });

    store.addItem({
      id: "2",
      name: "Product 2",
      price: 200000,
      image: "",
      stock: 10,
    });

    expect(store.getTotal()).toBe(300000);
  });

  it("should remove item from cart", () => {
    const store = useCartStore.getState();

    store.addItem({
      id: "1",
      name: "Test Product",
      price: 100000,
      image: "",
      stock: 10,
    });

    store.removeItem("1");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it("should cap quantity at stock when updating", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 3 });
    store.updateQuantity("1", 10);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("should add multiple quantity at once", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 10 }, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("should cap bulk add quantity at stock", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 3 }, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("should cap bulk add for existing item at stock", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 5 }, 3);
    store.addItem({ id: "1", name: "P", price: 100000, image: "", stock: 5 }, 4);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });
});
