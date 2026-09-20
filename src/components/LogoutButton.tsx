import { logoutAction } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="btn" type="submit">
        Đăng xuất
      </button>
    </form>
  );
}
