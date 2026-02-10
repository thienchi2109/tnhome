import { describe, it, expect } from "vitest";
import { toSlug, formatPrice, cn } from "@/lib/utils";

describe("toSlug", () => {
  describe("Vietnamese diacritics", () => {
    it("should convert Vietnamese text with diacritics to slug", () => {
      expect(toSlug("Phòng khách")).toBe("phong-khach");
    });

    it("should handle all Vietnamese tones", () => {
      // à, á, ả, ã, ạ
      expect(toSlug("à á ả ã ạ")).toBe("a-a-a-a-a");
      // è, é, ẻ, ẽ, ẹ
      expect(toSlug("è é ẻ ẽ ẹ")).toBe("e-e-e-e-e");
      // ì, í, ỉ, ĩ, ị
      expect(toSlug("ì í ỉ ĩ ị")).toBe("i-i-i-i-i");
      // ò, ó, ỏ, õ, ọ
      expect(toSlug("ò ó ỏ õ ọ")).toBe("o-o-o-o-o");
      // ù, ú, ủ, ũ, ụ
      expect(toSlug("ù ú ủ ũ ụ")).toBe("u-u-u-u-u");
      // ỳ, ý, ỷ, ỹ, ỵ
      expect(toSlug("ỳ ý ỷ ỹ ỵ")).toBe("y-y-y-y-y");
    });

    it("should handle Vietnamese vowels with circumflex", () => {
      // â, ê, ô
      expect(toSlug("ầ ấ ẩ ẫ ậ")).toBe("a-a-a-a-a");
      expect(toSlug("ề ế ể ễ ệ")).toBe("e-e-e-e-e");
      expect(toSlug("ồ ố ổ ỗ ộ")).toBe("o-o-o-o-o");
    });

    it("should handle Vietnamese vowels with breve and horn", () => {
      // ă (breve)
      expect(toSlug("ằ ắ ẳ ẵ ặ")).toBe("a-a-a-a-a");
      // ơ, ư (horn)
      expect(toSlug("ờ ớ ở ỡ ợ")).toBe("o-o-o-o-o");
      expect(toSlug("ừ ứ ử ữ ự")).toBe("u-u-u-u-u");
    });
  });

  describe("Vietnamese đ/Đ character", () => {
    it("should convert lowercase đ to d", () => {
      expect(toSlug("Đèn")).toBe("den");
      expect(toSlug("đèn")).toBe("den");
    });

    it("should convert uppercase Đ to d", () => {
      expect(toSlug("ĐÈN")).toBe("den");
      expect(toSlug("Đồ dùng")).toBe("do-dung");
    });

    it("should handle multiple đ/Đ characters", () => {
      expect(toSlug("Đồ điện tử")).toBe("do-dien-tu");
      expect(toSlug("ĐẠI ĐỘI ĐẶC BIỆT")).toBe("dai-doi-dac-biet");
    });
  });

  describe("real category names", () => {
    it("should convert Phòng khách correctly", () => {
      expect(toSlug("Phòng khách")).toBe("phong-khach");
    });

    it("should convert Phòng ngủ correctly", () => {
      expect(toSlug("Phòng ngủ")).toBe("phong-ngu");
    });

    it("should convert Phòng bếp correctly", () => {
      expect(toSlug("Phòng bếp")).toBe("phong-bep");
    });

    it("should convert Phòng tắm correctly", () => {
      expect(toSlug("Phòng tắm")).toBe("phong-tam");
    });

    it("should convert Ngoài trời correctly", () => {
      expect(toSlug("Ngoài trời")).toBe("ngoai-troi");
    });

    it("should convert Đèn & Đồ trang trí correctly", () => {
      expect(toSlug("Đèn & Đồ trang trí")).toBe("den-do-trang-tri");
    });
  });

  describe("empty and whitespace handling", () => {
    it("should return empty string for empty input", () => {
      expect(toSlug("")).toBe("");
    });

    it("should return empty string for whitespace-only input", () => {
      expect(toSlug("   ")).toBe("");
      expect(toSlug("\t\n")).toBe("");
    });

    it("should trim leading and trailing whitespace", () => {
      expect(toSlug("  hello  ")).toBe("hello");
      expect(toSlug("\tworld\n")).toBe("world");
    });
  });

  describe("special characters", () => {
    it("should replace special characters with hyphens", () => {
      expect(toSlug("hello!@#$%world")).toBe("hello-world");
    });

    it("should handle ampersand", () => {
      expect(toSlug("Đèn & Bàn")).toBe("den-ban");
    });

    it("should handle parentheses and brackets", () => {
      expect(toSlug("Category (New)")).toBe("category-new");
      expect(toSlug("Category [Sale]")).toBe("category-sale");
    });

    it("should handle multiple consecutive special characters", () => {
      expect(toSlug("hello---world")).toBe("hello-world");
      expect(toSlug("hello   world")).toBe("hello-world");
      expect(toSlug("hello...world")).toBe("hello-world");
    });

    it("should not have leading or trailing hyphens", () => {
      expect(toSlug("---hello---")).toBe("hello");
      expect(toSlug("!hello!")).toBe("hello");
      expect(toSlug("@@@test@@@")).toBe("test");
    });
  });

  describe("case handling", () => {
    it("should convert to lowercase", () => {
      expect(toSlug("HELLO WORLD")).toBe("hello-world");
      expect(toSlug("Hello World")).toBe("hello-world");
    });

    it("should handle mixed case Vietnamese", () => {
      expect(toSlug("PHÒNG KHÁCH")).toBe("phong-khach");
      expect(toSlug("phòng KHÁCH")).toBe("phong-khach");
    });
  });

  describe("numbers", () => {
    it("should preserve numbers", () => {
      expect(toSlug("Room 123")).toBe("room-123");
      expect(toSlug("2024 Collection")).toBe("2024-collection");
    });

    it("should handle numbers with Vietnamese text", () => {
      expect(toSlug("Phòng số 1")).toBe("phong-so-1");
    });

    it("should handle pure numeric input", () => {
      expect(toSlug("12345")).toBe("12345");
    });
  });

  describe("edge cases", () => {
    it("should handle single character", () => {
      expect(toSlug("a")).toBe("a");
      expect(toSlug("đ")).toBe("d");
      expect(toSlug("Đ")).toBe("d");
    });

    it("should handle very long strings", () => {
      const longText = "Phòng khách ".repeat(100).trim();
      const result = toSlug(longText);
      expect(result).toContain("phong-khach");
      expect(result.startsWith("-")).toBe(false);
      expect(result.endsWith("-")).toBe(false);
    });

    it("should handle unicode that is not Vietnamese", () => {
      expect(toSlug("café")).toBe("cafe");
      expect(toSlug("naïve")).toBe("naive");
      expect(toSlug("résumé")).toBe("resume");
    });

    it("should handle input with only special characters", () => {
      expect(toSlug("!@#$%^&*()")).toBe("");
      expect(toSlug("---")).toBe("");
    });
  });
});

describe("formatPrice", () => {
  it("should format VND price correctly", () => {
    const formatted = formatPrice(100000);
    expect(formatted).toContain("100");
    expect(formatted).toContain("000");
  });

  it("should handle zero", () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain("0");
  });

  it("should handle large numbers", () => {
    const formatted = formatPrice(1000000);
    expect(formatted).toContain("1");
  });
});

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("should handle conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "included", false && "excluded")).toBe(
      "base included"
    );
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });
});
