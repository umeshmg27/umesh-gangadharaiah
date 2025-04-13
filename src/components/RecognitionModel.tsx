import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

type Props = {
  item: {
    title: string;
    image: string;
    description: string;
  } | null;
  onClose: () => void;
};

const RecognitionModal: React.FC<Props> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item.title}</DialogTitle>
      <DialogContent>
        <img src={item.image} alt={item.title} style={{ width: '100%', marginBottom: '1rem' }} />
        <Typography variant="body1">{item.description}</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RecognitionModal;
