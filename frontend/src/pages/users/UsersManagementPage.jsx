import { useState, useEffect } from 'react';
import { Users, Search, Filter, RefreshCw } from 'lucide-react';
import userService from '@/services/userService';
import UserCard from '@/components/users/UserCard';
import UserDetailModal from '@/components/users/UserDetailModal';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  // ✅ Estado para el modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      let response;
      if (filter === 'pending') {
        response = await userService.getPendingUsers();
      } else {
        response = await userService.getAllUsers({
          isActive: filter === 'approved' ? 'true' : undefined,
        });
      }

      const usersData = response.data || [];
      setUsers(usersData);

      console.log('✅ Users loaded:', usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setProcessingUserId(userId);
      await userService.approveUser(userId);
      toast.success('Usuario aprobado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      const message = error.response?.data?.message || 'Error al aprobar usuario';
      toast.error(message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Ingrese el motivo del rechazo (mínimo 10 caracteres):');

    if (!reason) {
      toast.error('Debes proporcionar un motivo');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('El motivo debe tener al menos 10 caracteres');
      return;
    }

    try {
      setProcessingUserId(userId);
      await userService.rejectUser(userId, reason);
      toast.success('Usuario rechazado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      const message = error.response?.data?.message || 'Error al rechazar usuario';
      toast.error(message);
    } finally {
      setProcessingUserId(null);
    }
  };

  // ✅ Handler para ver detalles
  const handleViewDetails = (user) => {
    console.log('Opening details for user:', user);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.dni?.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">
            Aprobar o rechazar solicitudes de registro
          </p>
        </div>

        <Button
          onClick={loadUsers}
          variant="secondary"
          size="md"
          isLoading={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o DNI..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      {loading ? (
        <Loader text="Cargando usuarios..." />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 font-medium mb-2">No se encontraron usuarios</p>
          <p className="text-sm text-gray-500">
            {filter === 'pending'
              ? 'No hay usuarios pendientes de aprobación'
              : searchTerm
              ? 'Intenta cambiar los términos de búsqueda'
              : 'No hay usuarios con los filtros seleccionados'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando{' '}
              <span className="font-semibold text-gray-900">{filteredUsers.length}</span>{' '}
              {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
              {searchTerm && (
                <span className="ml-1">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Grid de UserCards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails} // ✅ PROP CORRECTA
                isLoading={processingUserId === user.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de Detalles */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
