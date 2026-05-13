import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';

const App = () => {
  // ========== STATE MANAGEMENT (ARRAY OBJECT) ==========
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  // ========== HITUNG TOTAL SALDO ==========
  // Rumus: Total Pemasukan - Total Pengeluaran
  const calculateBalance = () => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    transactions.forEach(item => {
      if (item.tipe === 'masuk') {
        totalPemasukan += item.nominal;
      } else {
        totalPengeluaran += item.nominal;
      }
    });
    
    // Saldo = PEMASUKAN - PENGELUARAN
    return totalPemasukan - totalPengeluaran;
  };

  const balance = calculateBalance();

  // Hitung total pemasukan
  const totalIncome = transactions
    .filter(item => item.tipe === 'masuk')
    .reduce((sum, item) => sum + item.nominal, 0);

  // Hitung total pengeluaran
  const totalExpense = transactions
    .filter(item => item.tipe === 'keluar')
    .reduce((sum, item) => sum + item.nominal, 0);

  // ========== FORMAT RUPIAH ==========
  const formatRupiah = (value) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(value));
    
    // Untuk nilai negatif, tambahkan tanda minus di depan
    if (value < 0) {
      return `-${formatted}`;
    }
    return formatted;
  };

  // ========== VALIDASI FORM ==========
  const validateForm = () => {
    if (!description.trim()) {
      Alert.alert('Oops!', 'Deskripsi transaksi tidak boleh kosong ✏️');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Oops!', 'Nominal harus diisi dengan angka lebih dari 0 💰');
      return false;
    }
    if (parseFloat(amount) > 1000000000) {
      Alert.alert('Oops!', 'Nominal terlalu besar! Maksimal 1 Miliar 😱');
      return false;
    }
    return true;
  };

  // ========== TAMBAH TRANSAKSI (ARRAY OBJECT) ==========
  const addTransaction = (type) => {
    if (!validateForm()) return;

    // Animasi feedback
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // STRUCTURE OBJECT SESUAI SOAL
    const newTransaction = {
      id: Date.now().toString(),
      ket: description.trim(),
      nominal: parseFloat(amount),
      tipe: type, // 'masuk' atau 'keluar'
    };

    // UPDATE STATE ARRAY
    setTransactions([newTransaction, ...transactions]);
    
    // RESET FORM
    setDescription('');
    setAmount('');
    
    // FEEDBACK SUKSES
    Alert.alert(
      'Berhasil! 🎉',
      `Transaksi ${type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'} telah ditambahkan`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // ========== HAPUS TRANSAKSI ==========
  const deleteTransaction = (id, ket, nominal, tipe) => {
    Alert.alert(
      'Hapus Transaksi',
      `Yakin ingin menghapus "${ket}" sebesar ${formatRupiah(nominal)}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => {
            setTransactions(transactions.filter(item => item.id !== id));
            Alert.alert('Terhapus!', 'Transaksi berhasil dihapus 🗑️');
          }
        }
      ]
    );
  };

  // ========== RENDER ITEM TRANSAKSI ==========
  const renderTransactionItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onLongPress={() => deleteTransaction(item.id, item.ket, item.nominal, item.tipe)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View style={[
          styles.iconWrapper,
          item.tipe === 'masuk' ? styles.incomeIconWrapper : styles.expenseIconWrapper
        ]}>
          <Text style={styles.transactionIcon}>
            {item.tipe === 'masuk' ? '📥' : '📤'}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.ket}</Text>
          <Text style={styles.transactionTime}>
            {new Date(parseInt(item.id)).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      <Text style={[
        styles.transactionNominal,
        item.tipe === 'masuk' ? styles.incomeText : styles.expenseText
      ]}>
        {item.tipe === 'masuk' ? '+' : '-'} {formatRupiah(item.nominal)}
      </Text>
    </TouchableOpacity>
  );

  // ========== EMPTY STATE ==========
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🏦</Text>
      </View>
      <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
      <Text style={styles.emptySubtitle}>
        Yuk catat pemasukan atau pengeluaranmu
      </Text>
      <View style={styles.emptyHint}>
        <Text style={styles.emptyHintText}>💡 Tekan + untuk menambah</Text>
      </View>
    </View>
  );

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ========== HEADER DENGAN SALDO ========== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.appName}>DompetKu</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
              </Text>
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Saldo</Text>
            <Animated.Text style={[
              styles.balanceAmount,
              { opacity: fadeAnim },
              balance >= 0 ? styles.balancePositive : styles.balanceNegative
            ]}>
              {formatRupiah(balance)}
            </Animated.Text>
            <View style={styles.badgeContainer}>
              <View style={[
                styles.badge,
                balance >= 0 ? styles.badgePositive : styles.badgeNegative
              ]}>
                <Text style={styles.badgeText}>
                  {balance >= 0 ? '💚 Aman' : '❤️ Darurat'}
                </Text>
              </View>
            </View>
          </View>

          {/* Ringkasan Pemasukan & Pengeluaran */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📈</Text>
              <Text style={styles.summaryLabel}>Pemasukan</Text>
              <Text style={styles.summaryIncome}>{formatRupiah(totalIncome)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📉</Text>
              <Text style={styles.summaryLabel}>Pengeluaran</Text>
              <Text style={styles.summaryExpense}>{formatRupiah(totalExpense)}</Text>
            </View>
          </View>
        </View>

        {/* ========== FORM INPUT ========== */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionIcon}>✏️</Text> Catat Transaksi
          </Text>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Nama transaksi..."
              placeholderTextColor="#AAA"
              value={description}
              onChangeText={setDescription}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nominal (Rp)"
              placeholderTextColor="#AAA"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* 2 TOMBOL: PEMASUKAN & PENGELUARAN */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnIncome]}
              onPress={() => addTransaction('masuk')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnIcon}>➕</Text>
              <Text style={styles.btnText}>Pemasukan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.btn, styles.btnExpense]}
              onPress={() => addTransaction('keluar')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnIcon}>➖</Text>
              <Text style={styles.btnText}>Pengeluaran</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.hint}>
            💡 Tekan lama pada transaksi untuk menghapus
          </Text>
        </View>

        {/* ========== RIWAYAT TRANSAKSI (FLATLIST) ========== */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.sectionIcon}>📋</Text> Riwayat Transaksi
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{transactions.length}</Text>
            </View>
          </View>
          
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={EmptyList}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ========== STYLES (DESAIN KEREN) ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },
  
  // HEADER STYLES
  header: {
    backgroundColor: '#1B3B2B',
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  balancePositive: {
    color: '#A8E6CF',
  },
  balanceNegative: {
    color: '#FFB3B3',
  },
  badgeContainer: {
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgePositive: {
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
  },
  badgeNegative: {
    backgroundColor: 'rgba(255, 179, 179, 0.2)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // SUMMARY ROW
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 20,
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  summaryCard: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  summaryIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A8E6CF',
  },
  summaryExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFB3B3',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  
  // FORM SECTION
  formSection: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: -10,
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B3B2B',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1B3B2B',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnIncome: {
    backgroundColor: '#34C759',
  },
  btnExpense: {
    backgroundColor: '#FF3B30',
  },
  btnIcon: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // HISTORY SECTION
  historySection: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countBadge: {
    backgroundColor: '#F0F4F0',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3B2B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // TRANSACTION CARD
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  incomeIconWrapper: {
    backgroundColor: '#E8F5E9',
  },
  expenseIconWrapper: {
    backgroundColor: '#FFEBEE',
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B3B2B',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 11,
    color: '#AAA',
  },
  transactionNominal: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeText: {
    color: '#34C759',
  },
  expenseText: {
    color: '#FF3B30',
  },
  
  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B3B2B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyHint: {
    backgroundColor: '#F0F4F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyHintText: {
    fontSize: 12,
    color: '#1B3B2B',
  },
});

export default App;