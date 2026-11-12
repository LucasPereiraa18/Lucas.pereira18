import { auth } from "@/src/lib/neon/auth-server";
export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
