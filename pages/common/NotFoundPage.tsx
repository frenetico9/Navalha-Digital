import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { NAVALHA_LOGO_URL } from '../../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gradient-to-br from-white to-light-blue p-6 text-center">
      <img src={NAVALHA_LOGO_URL} alt="Navalha Digital Logo" className="w-36 h-36 sm:w-48 sm:h-48 object-contain mb-6" />
      <h1 className="text-5xl sm:text-6xl font-bold text-primary-blue mb-4">404</h1>
      <h2 className="text-2xl sm:text-3xl font-semibold text-text-dark mb-6">Página Não Encontrada</h2>
      <p className="text-text-light mb-8 max-w-md mx-auto">
        Oops! Parece que a página que você está procurando não existe ou foi movida.
        Verifique o endereço ou volte para a página inicial.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          <span className="material-icons-outlined mr-2">home</span>
          Voltar para a Página Inicial
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;