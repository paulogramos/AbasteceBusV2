import { Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/Autenticacao';
import type { Perfil } from '../contextos/Autenticacao';

interface Props {
  children: React.ReactNode;
  perfisPermitidos?: Perfil[];
}

export default function RotaProtegida({ children, perfisPermitidos }: Props) {
  const { estaLogado, sessao } = useAuth();

  if (!estaLogado) {
    return <Navigate to="/login" replace />;
  }

  if (perfisPermitidos && sessao && !perfisPermitidos.includes(sessao.perfil)) {
    return <Navigate to="/painel" replace />;
  }

  return <>{children}</>;
}