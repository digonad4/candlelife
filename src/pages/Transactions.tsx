
import { useAuth } from "@/context/AuthContext";
import { useTransactionsPage } from "@/hooks/useTransactionsPage";
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader";
import { TransactionsContent } from "@/components/transactions/TransactionsContent";
import { TransactionSummary } from "@/components/transactions/TransactionSummary";
import { TransactionDialogs } from "@/components/transactions/TransactionDialogs";

const Transactions = () => {
  const { user } = useAuth();
  const {
    dateRange, startDate, endDate, searchTerm,
    isEditModalOpen, isDeleteDialogOpen, isConfirmPaymentDialogOpen,
    selectedTransaction, transactionToDelete, transactionToConfirm,
    days, isLoading, totalTransactions, totalIncome, totalExpenses, balance,
    selectedTransactions,
    setDateRange, setStartDate, setEndDate, setSearchTerm,
    setIsEditModalOpen, setIsDeleteDialogOpen, setIsConfirmPaymentDialogOpen,
    handleEdit, handleDeleteTransaction, handleConfirmTransaction, handlePrint,
    toggleSelection, selectAll, deselectAll
  } = useTransactionsPage();

  return (
    <div className="w-full flex flex-col gap-2 max-w-7xl mx-auto h-full">
      <TransactionsHeader
        dateRange={dateRange} startDate={startDate} endDate={endDate}
        searchTerm={searchTerm} onDateRangeChange={setDateRange}
        onStartDateChange={setStartDate} onEndDateChange={setEndDate}
        onSearchChange={setSearchTerm} onPrintExtract={handlePrint}
      />
      
      <TransactionsContent
        days={days} isLoading={isLoading}
        selectedTransactions={selectedTransactions} searchTerm={searchTerm}
        onToggleSelection={toggleSelection} onSelectAll={selectAll}
        onDeselectAll={deselectAll} onEdit={handleEdit}
        onDelete={handleDeleteTransaction} onConfirmPayment={handleConfirmTransaction}
        onConfirmSelected={() => setIsConfirmPaymentDialogOpen(true)}
        onDeleteSelected={() => setIsDeleteDialogOpen(true)}
      />
      
      <TransactionSummary
        totalTransactions={totalTransactions} totalIncome={totalIncome}
        totalExpenses={totalExpenses} balance={balance}
      />

      <TransactionDialogs
        isEditModalOpen={isEditModalOpen} setIsEditModalOpen={setIsEditModalOpen}
        selectedTransaction={selectedTransaction}
        isDeleteDialogOpen={isDeleteDialogOpen} setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        transactionToDelete={transactionToDelete}
        isConfirmPaymentDialogOpen={isConfirmPaymentDialogOpen}
        setIsConfirmPaymentDialogOpen={setIsConfirmPaymentDialogOpen}
        transactionToConfirm={transactionToConfirm}
        userId={user?.id} selectedTransactions={selectedTransactions}
      />
    </div>
  );
};

export default Transactions;
