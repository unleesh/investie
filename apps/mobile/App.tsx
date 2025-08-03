import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { MarketSummaryCard } from './src/components/cards/MarketSummaryCard';
import { StockCard } from './src/components/cards/StockCard';
import { AIChatbot } from './src/components/ai/AIChatbot';
import { getMarketSummary, getStock } from '@investie/mock';

export default function App() {
  const marketData = getMarketSummary();
  const appleStock = getStock('AAPL');
  const teslaStock = getStock('TSLA');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hello Investie Mobile</Text>
        <Text style={styles.headerSubtitle}>Phase 0 - Foundation Complete</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Market Summary */}
        <MarketSummaryCard data={marketData} />

        {/* Sample Stock Cards */}
        {appleStock && <StockCard data={appleStock} />}
        {teslaStock && <StockCard data={teslaStock} />}

        {/* AI Chatbot */}
        <AIChatbot />

        {/* Footer Spacer */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: '#f3f4f6',
    fontSize: 24,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
});
