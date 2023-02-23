export type Brand = {
  id: string;
  name: string;
};

export type User = {
  id?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  providerId: number;
  ipAddress?: string;
  avatarImage?: string;
};

export type CheckEmailResponse = {
  found: boolean;
  fullName?: string;
};

export type ChatSettings = {
  name: string;
  color: string;
  logo: string;
  providerId: number;
  brandId: number;
  isActive: boolean;
};

export type StyleProps = {
  backgroundColor: string;
};
