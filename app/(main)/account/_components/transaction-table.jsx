"use client";

import React from 'react'
import { Table, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { categoryColors } from '@/data/categories';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, RefreshCw, Search, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { bulkDeleteTransactions } from '@/actions/account';
import { toast } from 'sonner';

const RECCURING_INTERVALS = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly"
}

const transactionTable = ({transactions}) => {

  const router = useRouter();

  const [selectedIds, setSelectedIds] = useSate([]);
  const [sortConfig, setSortConfig] = useSate({
    field: "date",
    direction: "desc"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    loading:deleteFn,
    fn = deleteFn,
    data: deleted
  } = useFetch(bulkDeleteTransactions);
    


    const filteredAndSortedTransactions = useMemo(()=>{
      let result = [...transactions];

      if(searchTerm){
        const searchLower = searchTerm.toLowerCase();
        result = result.filter((transactions)=> transaction.description?.toLowerCase().includes(searchLower));
      }

      if(recurringFilter){
        result = result.filter((transaction)=>{
          if(recurringFilter === "recurring") return transaction.isRecurrinv;
          return !transaction.usRecurring;
        });
      }

      if(typeFilter){
        result = result.filter((transaction)=> transaction.type === typeFilter)
      }


      result.sort((a,b)=>{
        let comparison = 0

        switch (sortConfig.field) {
          case "date":
            comparison = new Date(a.date) - new Date(b.date);
            break;
          case "amount":
            comparison = a.amount - b.amount;
            break;
          case "category":
            comparison = a.category.localCompare(b.category);
            break;
          default:
            comparison = 0;
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      })

      return result;
    },[transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

    const handleSort = (field) => {
      setSortConfig(current=> ({
        field,
        direction:
          current.field == field && current.direction === "asc" ? "desc" : "asc",
      }))
    };

    const handleSelect = (id) => {
      setSelectedIds(current => current.includes(id) ? current.filter (item => item!=id):[...current, id])
    };

    const handleSelectAll = () => {
      setSelectedIds(current => current.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map((t)=> t.id))
    };

    const handleBulkDelete = () => {
      if(
        !window.confirm(
          `Are you sure you want to delete ${selectedIds.length} transactions`
        )
      ) {
        return;
      }
      deleteFn(selectedIds);
    };

    useEffect(()=>{
      if(deleted && !deleteLoading){
        toast.error("Transactions deleted successfully");
      }
    })

    const handleClearFilter = () => {
      setSearchTerm("");
      setTypeFilter("");
      setRecurringFilter("");
      setSelectedIds([]);
    }

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      
      {/* Filters */}

      <div className="flex flex-col sm:flex-row gap-4">

        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder= "Search transactions.."
            value={searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={recurringFilter}
          onValueChange={(value)=>setRecurringFilter(value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recurring">Recurring only</SelectItem>
            <SelectItem value="non-recurring">Non-Recurring only</SelectItem>
          </SelectContent>
        </Select>


        {selectedIds.length>0 && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onCLick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Deleted selected ({selectedIds.length})
            </Button>
          </div>
        )}

        {(searchTerm || typeFilter || recurringFilter) && (
          <Button className="h-4 w-5" variant="outline" size="icon" onCLick={handleClearFilter} title="Clear Filters"> </Button>
        )}
        </div>

      </div>


      {/* Transactions */}
      <div className="rounded-md border">
        <Table>

            <TableHeader>
              <TableRow>
                
                <TableHead className="w-[50px]">
                    <Checkbox onCheckChange={handleSelectAll}
                      checked={
                        selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0
                      }
                    />
                </TableHead>

                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex item-center">Date{" "}
                    {sortConfig.field === "date" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>

                <TableHead>Description</TableHead>

                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  <div className="flex item-center">Category{" "}
                      {sortConfig.field === "category" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                  </div>
                </TableHead>

                <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                  <div className="flex item-center">Amount{" "}
                      {sortConfig.field === "amount" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                  </div>
                </TableHead>

                <TableHead>Recurring</TableHead>
                <TableHead className="w-[50px]"></TableHead>

            </TableRow>
            </TableHeader>

            <TableBody>
                {filteredAndSortedTransactions.length === 0?(
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">
                            No Transaction Found
                        </TableCell>
                    </TableRow>
                ) : (

                  filteredAndSortedTransactions.map((transactions)=>{
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox onCheckChange={()=> handleSelect(transaction.id)}
                          checked = {selectedIds.includes(transaction.id)}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                      <TableCell>{transaction.description}</TableCell>

                      <TableCell className="capitalize">
                        <span style={{
                          background: categoryColors[transaction.category],
                        }}className="px-3 py-1 rounded text-white text-sm"
                        >
                          {transaction.category}</span>
                      </TableCell>
                      
                      <TableCell className="text-right font-medium"
                        style={{
                          color: transaction.type === "EXPENSE" ? "red" : "green",
                        }}
                        >
                          {Transaction.type === "EXPENSE" ? "-" : "+"}
                          ${transaction.amount.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        {transaction.isReccuring?(
                          <TooltipProvider>
                          <Tooltip>

                            <TooltipTrigger>
                              <Badge className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200" variant="outline">
                                <RefreshCw className="h-3 w-3" />
                                {
                                  RECURRING_INTERVALS[
                                    transaction.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>

                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium">Next Date:</div>
                                <div>
                                  {format(new Date(transaction.nextRecurringDate), "PP")}
                                </div>
                              </div>
                            </TooltipContent>

                          </Tooltip>
                        </TooltipProvider>
                        
                        ) : <Badge className="gap-1" variant="outline">
                              <Clock className="h-3 w-3" />
                              One-time
                            </Badge>}
                      </TableCell>


                      <TableCell>
                        <DropdownMenu>

                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent>

                            <DropdownMenuItem
                              onClick={()=>{
                                router.push(
                                  `/transaction/create?edit=${transaction.id}`
                                )
                              }}
                              >
                              Edit
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-destructive"
                              onClick={()=> deleteFN([transaction.id])}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </TableCell>

                    </TableRow>
                  })
            )};
            </TableBody>
        </Table>

      </div>
      
    </div>
  )
}

export default transactionTable
