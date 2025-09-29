'use client';

import React, { useState, useEffect } from 'react';
import {
    Star,
    Plus,
    Filter,
    Search,
    Calendar,
    ThumbsUp,
    MessageSquare,
    TrendingUp,
    Award,
    Users,
    BarChart3,
    AlertCircle
} from 'lucide-react';

// Interfaces alineadas con el backend FastAPI
interface Category {
    id: number;
    name: string;
    description?: string;
}

interface User {
    id: number;
    username: string;
    email?: string;
    role?: string;
}

interface Product {
    id: number;
    name: string;
    description?: string;
    category_id?: number;
    category?: Category; // Categoria anidada que viene del backend
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_id: number;
    product_id: number;
    user?: User; // Usuario anidado que viene del backend
    product?: Product; // Producto anidado que viene del backend
    // Propiedades adicionales para la UI
    date?: string;
    likes?: number;
    verified?: boolean;
}

interface ReviewFormData {
    rating: number;
    comment: string;
    user_id: number;
    product_id: number;
}

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Funciones de API mejoradas con manejo de errores
const apiClient = {
    async get(endpoint: string) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    },

    async post(endpoint: string, data: any) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error posting to ${endpoint}:`, error);
            throw error;
        }
    }
};

export default function ReviewsPage() {
    // Estados
    const [reviews, setReviews] = useState<Review[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Cargar datos en paralelo
                const [categoriesData, productsData, usersData] = await Promise.all([
                    apiClient.get('/categories/'),
                    apiClient.get('/products/'),
                    apiClient.get('/users/')
                ]);

                setCategories(categoriesData);
                setProducts(productsData);
                setUsers(usersData);

                // Cargar reseñas (que ya vienen con datos anidados del backend)
                try {
                    const reviewsData = await apiClient.get('/reviews/');
                    
                    // Enriquecer con datos adicionales para la UI
                    const enrichedReviews = reviewsData.map((review: Review) => ({
                        ...review,
                        date: new Date().toISOString().split('T')[0], // Simular fecha
                        likes: Math.floor(Math.random() * 50), // Simular likes
                        verified: Math.random() > 0.5 // Simular verificación
                    }));

                    setReviews(enrichedReviews);
                } catch (reviewError) {
                    // Si no hay reseñas, no es un error crítico
                    console.log('No reviews found or error loading reviews:', reviewError);
                    setReviews([]);
                }

            } catch (error) {
                console.error('Error loading data:', error);
                setError('Error al conectar con el backend. Asegúrate de que el servidor FastAPI esté ejecutándose en http://127.0.0.1:8000');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filtrar y ordenar reseñas
    useEffect(() => {
        filterAndSortReviews();
    }, [reviews, searchTerm, filterRating, filterCategory, sortBy]);

    const filterAndSortReviews = () => {
        let filtered = [...reviews];

        // Filtrar por búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(review =>
                review.comment?.toLowerCase().includes(searchLower) ||
                review.user?.username?.toLowerCase().includes(searchLower) ||
                review.product?.name?.toLowerCase().includes(searchLower) ||
                review.product?.category?.name?.toLowerCase().includes(searchLower)
            );
        }

        // Filtrar por rating
        if (filterRating !== 'all') {
            filtered = filtered.filter(review => review.rating >= parseInt(filterRating));
        }

        // Filtrar por categoría
        if (filterCategory !== 'all') {
            const categoryId = parseInt(filterCategory);
            filtered = filtered.filter(review => review.product?.category?.id === categoryId);
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.id - a.id; // Ordenar por ID descendente como proxy de fecha
                case 'oldest':
                    return a.id - b.id;
                case 'rating-high':
                    return b.rating - a.rating;
                case 'rating-low':
                    return a.rating - b.rating;
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                default:
                    return 0;
            }
        });

        setFilteredReviews(filtered);
    };

    // Componente de rating con estrellas
    const StarRating: React.FC<{
        rating: number;
        size?: 'small' | 'medium' | 'large';
        interactive?: boolean;
        onRatingChange?: (rating: number) => void;
    }> = ({ rating, size = 'medium', interactive = false, onRatingChange }) => {
        const sizeClasses = {
            small: 'w-4 h-4',
            medium: 'w-5 h-5',
            large: 'w-6 h-6'
        };

        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:text-amber-300 transition-colors' : ''}`}
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                    />
                ))}
            </div>
        );
    };

    // Modal para crear nueva reseña
    const CreateReviewModal: React.FC = () => {
        const [formData, setFormData] = useState<ReviewFormData>({
            rating: 5,
            comment: '',
            user_id: users.length > 0 ? users[0].id : 1,
            product_id: 0
        });
        const [submitting, setSubmitting] = useState(false);

        const handleSubmit = async () => {
            if (!formData.product_id || !formData.comment.trim()) {
                alert('Por favor completa todos los campos');
                return;
            }

            setSubmitting(true);
            try {
                const newReview = await apiClient.post('/reviews/', formData);
                
                // El backend ya devuelve la reseña con datos anidados
                const enrichedReview = {
                    ...newReview,
                    date: new Date().toISOString().split('T')[0],
                    likes: 0,
                    verified: false
                };

                setReviews([enrichedReview, ...reviews]);
                setShowCreateModal(false);
                setFormData({
                    rating: 5,
                    comment: '',
                    user_id: users.length > 0 ? users[0].id : 1,
                    product_id: 0
                });
            } catch (error) {
                console.error('Error creating review:', error);
                alert('Error al crear la reseña. Verifica que el backend esté funcionando.');
            } finally {
                setSubmitting(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Nueva Reseña
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Usuario
                            </label>
                            <select
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            >
                                {users.map((user) => (
                                    <option key={user.id} value={user.id} className="text-black">
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Producto
                            </label>
                            <select
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            >
                                <option value={0} className="text-gray-500">Selecciona un producto</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id} className="text-black">
                                        {product.name} {product.description ? `- ${product.description}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Calificación
                            </label>
                            <StarRating
                                rating={formData.rating}
                                size="large"
                                interactive={true}
                                onRatingChange={(rating) => setFormData({ ...formData, rating })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tu comentario
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-black placeholder-gray-500"
                                placeholder="Comparte los detalles de tu experiencia..."
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {submitting ? 'Publicando...' : 'Publicar Reseña'}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={submitting}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Card individual de reseña
    const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">
                                {review.user?.username || `Usuario ${review.user_id}`}
                            </h4>
                            {review.verified && (
                                <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                    <Award size={12} />
                                    <span>Verificado</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                            {review.product?.name || `Producto ${review.product_id}`}
                        </p>
                        {review.product?.category?.name && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {review.product.category.name}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <Calendar size={16} />
                    <span>{review.date ? new Date(review.date).toLocaleDateString('es-ES') : 'Hoy'}</span>
                </div>
            </div>

            <div className="mb-3">
                <StarRating rating={review.rating} size="medium" />
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
                {review.comment || 'Sin comentario'}
            </p>

            <div className="flex items-center justify-between">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp size={16} />
                    <span className="text-sm font-medium">{review.likes || 0} útiles</span>
                </button>
            </div>
        </div>
    );

    // Estadísticas de reseñas
    const ReviewStats: React.FC = () => {
        const averageRating = reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
            : 0;

        const verifiedCount = reviews.filter(r => r.verified).length;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Promedio</p>
                            <p className="text-3xl font-bold text-blue-900">{averageRating.toFixed(1)}</p>
                            <StarRating rating={Math.round(averageRating)} size="small" />
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide">Total</p>
                            <p className="text-3xl font-bold text-purple-900">{reviews.length}</p>
                            <p className="text-sm text-purple-700">reseñas</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 font-semibold text-sm uppercase tracking-wide">Verificadas</p>
                            <p className="text-3xl font-bold text-green-900">{verifiedCount}</p>
                            <p className="text-sm text-green-700">{reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 0}% del total</p>
                        </div>
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>
        );
    };

    // Loading skeleton
    const ReviewSkeleton: React.FC = () => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
    );

    // Error component
    const ErrorMessage: React.FC = () => (
        <div className="text-center py-16">
            <AlertCircle size={64} className="mx-auto text-red-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-3">Error de conexión</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
            <div className="space-y-4">
                <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                >
                    Reintentar
                </button>
                <div className="text-sm text-gray-400 space-y-1">
                    <p>Asegúrate de que tu backend FastAPI esté ejecutándose</p>
                    <p>Comando: <code className="bg-gray-100 px-2 py-1 rounded text-xs">uvicorn src.main:app --reload</code></p>
                    <p>URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://127.0.0.1:8000</code></p>
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <ErrorMessage />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Reseñas de Productos
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">
                                Descubre experiencias reales con bicicletas y accesorios
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <Plus size={20} />
                            <span>Escribir Reseña</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estadísticas */}
                {!loading && <ReviewStats />}

                {/* Filtros y búsqueda */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Búsqueda */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por producto, usuario o comentario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm text-black placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-3">
                                <Filter size={18} className="text-gray-500" />
                                
                                {/* Filtro por categoría */}
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-black"
                                >
                                    <option className="text-black" value="all">Todas las categorías</option>
                                    {categories.map(category => (
                                        <option key={category.id} className="text-black" value={category.id.toString()}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Filtro por rating */}
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-black"
                                >
                                    <option className="text-black" value="all">Todas las estrellas</option>
                                    <option className="text-black" value="5">⭐⭐⭐⭐⭐</option>
                                    <option className="text-black" value="4">⭐⭐⭐⭐ y más</option>
                                    <option className="text-black" value="3">⭐⭐⭐ y más</option>
                                    <option className="text-black" value="2">⭐⭐ y más</option>
                                </select>
                            </div>

                            {/* Ordenamiento */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-black"
                            >
                                <option className="text-black" value="newest">Más recientes</option>
                                <option className="text-black" value="oldest">Más antiguas</option>
                                <option className="text-black" value="rating-high">Mejor valoradas</option>
                                <option className="text-black" value="rating-low">Menor valoración</option>
                                <option className="text-black" value="likes">Más útiles</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de reseñas */}
                <div className="space-y-6">
                    {loading ? (
                        // Loading skeletons
                        Array.from({ length: 3 }, (_, i) => <ReviewSkeleton key={i} />)
                    ) : filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    ) : (
                        // Estado vacío
                        <div className="text-center py-16">
                            <MessageSquare size={64} className="mx-auto text-gray-400 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-600 mb-3">No se encontraron reseñas</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filterRating !== 'all' || filterCategory !== 'all'
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Sé el primero en escribir una reseña'
                                }
                            </p>
                            {!searchTerm && filterRating === 'all' && filterCategory === 'all' && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                                >
                                    Escribir primera reseña
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de crear reseña */}
            {showCreateModal && <CreateReviewModal />}
        </div>
    );
}