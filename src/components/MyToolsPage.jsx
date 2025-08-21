import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X } from 'lucide-react';

const MyToolsPage = () => {
  const { token, user } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [confirmedAssignments, setConfirmedAssignments] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchPendingTransfers();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingAssignments(data.pending || []);
        setConfirmedAssignments(data.confirmed || []);
      } else {
        setError('Erro ao carregar atribuições');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const fetchPendingTransfers = async () => {
    try {
      const response = await fetch(`/api/transfers/pending/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingTransfers(data.pending_transfers || []);
      }
    } catch (error) {
      console.error('Erro ao carregar transferências pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAssignments();
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const handleRejectAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAssignments();
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const handleConfirmTransfer = async (transferId) => {
    try {
      const response = await fetch(`/api/transfers/${transferId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAssignments();
        fetchPendingTransfers();
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const handleRejectTransfer = async (transferId) => {
    try {
      const response = await fetch(`/api/transfers/${transferId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPendingTransfers();
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando suas ferramentas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Minhas Ferramentas</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pending Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Atribuições Pendentes de Confirmação</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAssignments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhuma atribuição pendente
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data de Atribuição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.tool_name}</TableCell>
                    <TableCell>{assignment.quantity}</TableCell>
                    <TableCell>
                      {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAssignment(assignment.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectAssignment(assignment.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Transfers */}
      {pendingTransfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transferências Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data da Transferência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.tool_name}</TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>
                      {new Date(transfer.transfer_initiated_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmTransfer(transfer.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectTransfer(transfer.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Emprestadas</CardTitle>
        </CardHeader>
        <CardContent>
          {confirmedAssignments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhuma ferramenta emprestada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data de Confirmação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.tool_name}</TableCell>
                    <TableCell>{assignment.quantity}</TableCell>
                    <TableCell>
                      {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {assignment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyToolsPage;

