import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import {
  searchProducts,
  calcDiscount,
  formatPrice,
  MLProduct,
} from "./src/services/mercadolibre";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MLProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await searchProducts(trimmed);
      // Ordena por mayor descuento primero
      const sorted = [...data.results].sort((a, b) => {
        const discA = calcDiscount(a.price, a.original_price);
        const discB = calcDiscount(b.price, b.original_price);
        return discB - discA;
      });
      setResults(sorted);
    } catch (e: any) {
      setError(e.message ?? "Error al buscar productos");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const renderItem = ({ item }: { item: MLProduct }) => {
    const discount = calcDiscount(item.price, item.original_price);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => Linking.openURL(item.permalink)}
      >
        <Image
          source={{ uri: item.thumbnail.replace("http://", "https://") }}
          style={styles.thumbnail}
          resizeMode="contain"
        />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            {discount > 0 && (
              <View style={styles.badgeDiscount}>
                <Text style={styles.badgeText}>-{discount}%</Text>
              </View>
            )}
          </View>

          {item.original_price && item.original_price > item.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(item.original_price)}
            </Text>
          )}

          <Text style={styles.seller}>
            {item.condition === "new" ? "Nuevo" : "Usado"} ·{" "}
            {item.seller.nickname}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Deal AI Finder</Text>
          <Text style={styles.headerSub}>Mejores ofertas de MercadoLibre CL</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Buscar productos..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* States */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Buscando ofertas...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
          </View>
        )}

        {!loading && !searched && (
          <View style={styles.centered}>
            <Text style={styles.hintText}>
              Busca cualquier producto para ver{"\n"}las mejores ofertas 🎯
            </Text>
          </View>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f1f5f9",
  },
  headerSub: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#f1f5f9",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: "#fff",
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  title: { fontSize: 13, color: "#e2e8f0", fontWeight: "500" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  price: { fontSize: 16, fontWeight: "700", color: "#6366f1" },
  originalPrice: {
    fontSize: 12,
    color: "#64748b",
    textDecorationLine: "line-through",
  },
  badgeDiscount: {
    backgroundColor: "#16a34a",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  seller: { fontSize: 11, color: "#64748b", marginTop: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10, fontSize: 14 },
  errorText: { color: "#f87171", fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  hintText: { color: "#64748b", fontSize: 15, textAlign: "center", lineHeight: 24 },
});
