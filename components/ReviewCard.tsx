import React, { useState } from 'react';
import { Review } from '../types';
import StarRating from './StarRating';
import Button from './Button';
import { format } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale/pt-BR';

interface ReviewCardProps {
  review: Review;
  isAdminView?: boolean;
  onReply?: (reviewId: string, replyText: string) => Promise<void>; // Make it async
  isReplying?: boolean; // To disable button while one reply is in progress
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'; // User
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isAdminView = false, onReply, isReplying }) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [localReplying, setLocalReplying] = useState(false);

  const handleReplySubmit = async () => {
    if (onReply && replyText.trim() && !isReplying && !localReplying) {
      setLocalReplying(true);
      try {
        await onReply(review.id, replyText);
        setReplyText('');
        setShowReplyInput(false);
      } finally {
        setLocalReplying(false);
      }
    }
  };

  const formattedDate = format(parseISO(review.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  const replyDate = review.replyAt ? format(parseISO(review.replyAt), "dd/MM/yy HH:mm", { locale: ptBR }) : '';
  const clientInitials = getInitials(review.clientName);

  return (
    <div className="p-5 rounded-lg shadow-lg border border-light-blue bg-white flex flex-col justify-between hover:shadow-xl transition-shadow">
      <div>
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-semibold mr-3">
            {clientInitials}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-800 text-md">{review.clientName || 'Cliente Anônimo'}</h4>
                <StarRating value={review.rating} isEditable={false} size={18} />
            </div>
            <p className="text-xs text-gray-500">Avaliado em: {formattedDate}</p>
          </div>
        </div>
        {review.comment && <p className="text-gray-700 text-sm mb-3 leading-relaxed bg-gray-50 p-3 rounded-md ml-13">"{review.comment}"</p>}
      </div>
      
      {review.reply && (
        <div className="mt-3 pt-3 border-t border-gray-200 bg-light-blue p-3 rounded-md ml-13">
          <p className="text-sm font-semibold text-primary-blue">Resposta da Barbearia <span className="text-xs text-gray-500">({replyDate})</span>:</p>
          <p className="text-sm text-gray-700 mt-1">{review.reply}</p>
        </div>
      )}

      {isAdminView && !review.reply && !showReplyInput && (
        <Button 
          onClick={() => setShowReplyInput(true)} 
          variant="outline" 
          size="sm" 
          className="mt-3 self-start ml-13"
          disabled={isReplying || localReplying}
        >
          <span className="material-icons-outlined text-sm mr-1">reply</span>Responder
        </Button>
      )}

      {isAdminView && showReplyInput && (
        <div className="mt-3 ml-13">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Digite sua resposta..."
            rows={3}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue"
            aria-label="Campo para resposta da avaliação"
          />
          <div className="mt-2 space-x-2 flex justify-end">
            <Button onClick={() => {setShowReplyInput(false); setReplyText('');}} variant="secondary" size="sm">Cancelar</Button>
            <Button onClick={handleReplySubmit} size="sm" isLoading={localReplying} disabled={isReplying || !replyText.trim()}>Enviar Resposta</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;