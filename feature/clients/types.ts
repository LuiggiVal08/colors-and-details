import type { Client } from '@/types/client';

export interface ClientCardProps {
  client: Client;
  onPress?: (client: Client) => void;
}

export interface ClientsListProps {
  clients: Client[];
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
