// Recognition.tsx
import React, { useEffect,useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardMedia, Chip,Stack, CardContent, Typography, CardActions, Button, Dialog, DialogTitle, DialogContent, DialogContentText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import '../assets/styles/Recognition.scss';

interface RecognitionCardProps {
  Image: string;
  Title: string;
  Description: string;
  Tags: string[];
  Identity: string;
}

const truncateText = (text: string, maxLength = 400) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const RecognitionCard: React.FC<RecognitionCardProps & { onReadMore?: () => void }> = ({ Image, Title, Description, Tags, onReadMore }) => (

  <Card className="recognition-card">
    <CardMedia component="img" height="400rem" src={Image} alt={Title} sx={{ objectFit: 'fill' }}  />
    <CardContent>
      <Typography gutterBottom variant="h6" noWrap>{Title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {truncateText(Description)}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
      {Tags.map((tag, index) => (
        <Chip key={index} label={tag} variant="outlined" size="small" />
      ))}
    </Stack>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={onReadMore}>Read More</Button>
    </CardActions>
  </Card>
);

  

const RecognitionSection: React.FC<{ title: string; items: RecognitionCardProps[] }> = ({ title, items }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecognitionCardProps | null>(null);
  

  const handleOpenModal = (item: RecognitionCardProps) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="recognition-category">
      <h2>{title}</h2>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {items.map((item, idx) => (
            <div className="embla__slide" key={`${title}-${idx}`}>
              <RecognitionCard {...item} onReadMore={() => handleOpenModal(item)} />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem?.Title}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem?.Image && (
            <img src={selectedItem.Image} alt={selectedItem.Title} style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }} />
          )}
          <DialogContentText>{selectedItem?.Description}</DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Recognition: React.FC = () => {
  const [mentorship_recognitions, setMentorship_Recognitions] = useState<RecognitionCardProps[]>([]);
  const [leadership_recognitions, setLeadership_Recognitions] = useState<RecognitionCardProps[]>([]);
  const [innovation_recognitions, setInnovation_Recognitions] = useState<RecognitionCardProps[]>([]);
  
  useEffect(() => {
    fetch("/react-portfolio-template/assets/json/mentorandteam.json")
  .then((res) => res.json())
  .then((data:RecognitionCardProps[]) => {
    const mentorship = data.filter((item: RecognitionCardProps) => item.Identity === "Mentorship");
    const leadership = data.filter((item:RecognitionCardProps) => item.Identity === "Leadership");
    const innovation = data.filter((item: RecognitionCardProps) => item.Identity === "Innovation");

    setMentorship_Recognitions(mentorship);
    setLeadership_Recognitions(leadership);
    setInnovation_Recognitions(innovation);
  })
  .catch((err) => console.error("Failed to load recognitions:", err));
  
  }, []);

  return (
    <div className="recognition-container" id="recognition">
      <h1>Recognition</h1>
      <RecognitionSection title="Innovation" items={innovation_recognitions} />
      <RecognitionSection title="Mentor and Team Player" items={mentorship_recognitions} />
     
      <RecognitionSection title="Leadership & Ownership" items={leadership_recognitions} />
      
    </div>
  );
};

export default Recognition;