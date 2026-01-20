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
    });

    store.addItem({
      id: "1",
      name: "Test Product",
      price: 100000,
      image: "/test.jpg",
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("should calculate total correctly", () => {
    const store = useCartStore.getState();

    store.addItem({
      id: "1",
      name: "Product 1",
      price: 100000,
      image: "",
    });

    store.addItem({
      id: "2",
      name: "Product 2",
      price: 200000,
      image: "",
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
    });

    store.removeItem("1");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });
});
