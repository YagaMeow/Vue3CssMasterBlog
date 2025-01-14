import { createPinia } from "pinia";
import { useAppStore } from "./modules/app";
import { useUserStore } from "./modules/user";
import { useRouterStore } from "./modules/router";


const store = createPinia()

export { store, useAppStore, useUserStore, useRouterStore }