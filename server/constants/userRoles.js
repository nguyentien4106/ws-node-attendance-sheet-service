export const UserRoles = 
{
    0: "Người dùng",
    // 2: "Khách",
    6: "Quản trị viên",
    // 14: "Chủ sở hữu"
}

export const getRole = role => UserRoles[role] ?? UserRoles[role > 0 ? 6 : 0];