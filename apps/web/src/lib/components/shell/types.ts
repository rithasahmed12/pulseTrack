export interface NavItem {
	label: string;
	href: string;
	isActive?: boolean;
	badge?: string | number;
}

export interface UserMenuUser {
	name: string;
	handle?: string;
	avatarUrl?: string;
}
