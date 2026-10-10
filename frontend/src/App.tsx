import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProvedorAuth } from './contextos/Autenticacao';
import PaginaLogin from './paginas/Login';
import PaginaPainel from './paginas/Painel';
import PaginaPainelPublico from './paginas/PainelPublico';
import PaginaDenuncia from './paginas/Denuncia';
import RotaProtegida from './componentes/RotaProtegida';
import FormularioUsuario from './paginas/usuarios/FormularioUsuario';

export default function App() {
  return (
    <ProvedorAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PaginaLogin />} />
          {/* cidadão vê sem login — fora do RotaProtegida de propósito */}
          <Route path="/painel-publico" element={<PaginaPainelPublico />} />
          {/* sprint 2 (S08): denúncia também é pública */}
          <Route path="/denuncia" element={<PaginaDenuncia />} />
          <Route
            path="/painel"
            element={
              <RotaProtegida>
                <PaginaPainel />
              </RotaProtegida>
            }
          />

          <Route
            path="/usuarios/novo"
            element={
              <RotaProtegida perfisPermitidos={['gestor']}>
                <FormularioUsuario />
              </RotaProtegida>
            }
          />
          <Route
            path="/usuarios/editar/:id"
            element={
              <RotaProtegida perfisPermitidos={['gestor']}>
                <FormularioUsuario />
              </RotaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAuth>
  );
}
