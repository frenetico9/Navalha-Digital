import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { NAVALHA_SVG_ICON, MIN_PASSWORD_LENGTH } from '../../constants';
import { useNotification } from '../../contexts/NotificationContext';

const BarbershopSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signupBarbershop, loading: authLoading } = useAuth();
  const { addNotification } = useNotification();

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      barbershopName: '',
      responsibleName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async (formValues) => {
      const newUser = await signupBarbershop(
        formValues.barbershopName,
        formValues.responsibleName,
        formValues.email,
        formValues.phone,
        formValues.address,
        formValues.password
      );
      if (newUser) {
        addNotification({ message: 'Cadastro da barbearia realizado com sucesso! Faça login para configurar.', type: 'success' });
        navigate('/login');
      }
      // Error notification handled by AuthContext or signup function
    },
    validate: (formValues) => {
      const newErrors: Record<string, string> = {};
      if (!formValues.barbershopName.trim()) newErrors.barbershopName = 'Nome da barbearia é obrigatório.';
      if (!formValues.responsibleName.trim()) newErrors.responsibleName = 'Nome do responsável é obrigatório.';
      if (!formValues.email.trim()) newErrors.email = 'E-mail é obrigatório.';
      else if (!/\S+@\S+\.\S+/.test(formValues.email)) newErrors.email = 'E-mail inválido.';
      if (!formValues.phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
      else if (!/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(formValues.phone)) newErrors.phone = 'Telefone inválido. Formato: (XX) XXXXX-XXXX ou XXXXXXXX.';
      if (!formValues.address.trim()) newErrors.address = 'Endereço é obrigatório.';
      if (!formValues.password) newErrors.password = 'Senha é obrigatória.';
      else if (formValues.password.length < MIN_PASSWORD_LENGTH) newErrors.password = `Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
      if (formValues.password !== formValues.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
      return newErrors;
    },
  });

  return (
    <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center bg-gradient-to-br from-white to-light-blue p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border border-primary-blue/20">
        <Link to="/" className="flex flex-col items-center mb-6 group">
          <span className="text-primary-blue w-16 h-16 sm:w-20 sm:h-20 group-hover:opacity-80 transition-opacity" dangerouslySetInnerHTML={{ __html: NAVALHA_SVG_ICON }} />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-center text-primary-blue group-hover:opacity-80 transition-opacity">Cadastro de Barbearia</h2>
        </Link>
        <p className="mb-6 text-sm text-center text-gray-600">Traga seu negócio para o Navalha Digital e simplifique sua gestão.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Barbearia"
            name="barbershopName"
            value={values.barbershopName}
            onChange={handleChange}
            error={errors.barbershopName}
            placeholder="Ex: Barbearia Estilo Único"
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="Nome do Responsável"
            name="responsibleName"
            value={values.responsibleName}
            onChange={handleChange}
            error={errors.responsibleName}
            placeholder="Seu nome completo"
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="E-mail de Contato da Barbearia"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="contato@suabarbearia.com"
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="Telefone Comercial (com DDD)"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="(XX) XXXXX-XXXX"
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="Endereço Completo da Barbearia"
            name="address"
            value={values.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Rua, Número, Bairro, Cidade - UF"
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="Senha de Acesso ao Painel"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
            disabled={isSubmitting || authLoading}
          />
          <Input
            label="Confirmar Senha"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Repita a senha criada"
            disabled={isSubmitting || authLoading}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting || authLoading} size="lg" className="mt-2">
            Cadastrar Barbearia
          </Button>
        </form>

        <p className="mt-8 text-xs sm:text-sm text-center text-gray-600">
          Já possui uma conta de barbearia?{' '}
          <Link to="/login" className="font-medium text-primary-blue hover:underline">
            Faça Login
          </Link>
        </p>
         <p className="mt-2 text-xs sm:text-sm text-center text-gray-600">
          Deseja apenas agendar um serviço?{' '}
          <Link to="/signup/client" className="font-medium text-primary-blue hover:underline">
            Cadastre-se como Cliente
          </Link>
        </p>
      </div>
       <Link to="/" className="mt-6 text-sm text-primary-blue hover:underline block text-center">
            &larr; Voltar para a Página Inicial
        </Link>
    </div>
  );
};

export default BarbershopSignupPage;