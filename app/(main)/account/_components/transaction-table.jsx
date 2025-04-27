"use client";

import React from 'react'
import { Table, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { categoryColors } from '@/data/categories';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

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

    const filteredAndSortedTransactions = transactions;

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

  return (
    <div className="space-y-4">
      
      {/* Filters */}

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

                            <DropdownMenuLabel 
                              onClick={()=>{
                                router.push(
                                  `/transaction/create?edit=${transaction.id}`
                                )
                              }}
                              >
                              Edit
                            </DropdownMenuLabel>
                            
                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-destructive"
                              // onClick={()=> deleteFN([transaction.id])}
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
