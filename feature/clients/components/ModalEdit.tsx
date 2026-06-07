import React from 'react';
import { View } from 'react-native';
import { EditClientForm } from './EditClientForm';
import type { Client } from '@/types/client';

interface ModalEditProps {
  client: Client;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditClientModal = ({ client, onClose, onSuccess }: ModalEditProps) => {
  return (
    <View className="flex-1">
      <EditClientForm initialData={client} onClose={onClose} onSuccess={onSuccess} />
    </View>
  );
};

export default EditClientModal;
