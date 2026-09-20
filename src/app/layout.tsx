import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Học liệu số Vật lí hạt nhân 12",description:"Học liệu số hỗ trợ dạy học theo mô hình lớp học đảo ngược."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
