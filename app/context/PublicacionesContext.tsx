// app/context/PublicacionesContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import publicacionService, { Publicacion } from "../../services/publicacionService";
import { useAuth } from "./AuthContext";

type NewPublicationInput = Omit<
  Publicacion,
  "id" | "fecha" | "status"
>;

type PublicationsContextType = {
  publicaciones: Publicacion[];
  isLoading: boolean;
  addPublication: (p: NewPublicationInput) => Promise<void>;
  updatePublication: (id: number, data: Partial<Publicacion>) => Promise<void>;
  deletePublication: (id: number) => Promise<void>;
  getById: (id: number) => Publicacion | undefined;
  refreshPublicaciones: () => Promise<void>;
};

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);

export const PublicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPublicaciones();
    }
  }, [isAuthenticated, user]);

  const loadPublicaciones = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await publicacionService.getPublicacionesByUsuario(user.id);
      setPublicaciones(data);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPublication = async (p: NewPublicationInput) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    try {
      setIsLoading(true);
      const newPub = {
        ...p,
        usuarioId: user.id,
        fecha: new Date().toISOString(),
        status: "disponible"
      };
      
      const response = await publicacionService.createPublicacion(newPub);
      
      // Recargar la lista
      await loadPublicaciones();
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePublication = async (id: number, data: Partial<Publicacion>) => {
    try {
      setIsLoading(true);
      await publicacionService.updatePublicacion(id, data);
      
      // Actualizar localmente
      setPublicaciones((s) => s.map((x) => (x.id === id ? { ...x, ...data } : x)));
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePublication = async (id: number) => {
    try {
      setIsLoading(true);
      await publicacionService.deletePublicacion(id);
      
      // Actualizar localmente
      setPublicaciones((s) => s.filter((x) => x.id !== id));
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = (id: number) => publicaciones.find((p) => p.id === id);

  const refreshPublicaciones = async () => {
    await loadPublicaciones();
  };

  return (
    <PublicationsContext.Provider value={{ 
      publicaciones, 
      isLoading,
      addPublication, 
      updatePublication, 
      deletePublication, 
      getById,
      refreshPublicaciones
    }}>
      {children}
    </PublicationsContext.Provider>
  );
};

export const usePublications = () => {
  const ctx = useContext(PublicationsContext);
  if (!ctx) throw new Error("usePublications must be used within PublicationsProvider");
  return ctx;
};
