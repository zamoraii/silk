import { createContext, useContext, type RefObject } from "react";

export const SilkContainerContext = createContext<RefObject<HTMLDivElement | null>>({
  current: null,
});

export function useSilkContainer() {
  return useContext(SilkContainerContext);
}
