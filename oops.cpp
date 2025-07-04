#include <iostream>
#include <string>
using namespace std;

// ✅ Abstract base class → Abstraction
class BankAccount {
protected:
    string accountNumber;
    string accountHolder;
    double balance;

public:
    // ✅ Constructor
    BankAccount(string accNum, string holder, double bal)
        : accountNumber(accNum), accountHolder(holder), balance(bal) {}

    // ✅ Virtual destructor
    virtual ~BankAccount() {}

    // ✅ Encapsulation → Getters
    string getAccountNumber() const { return accountNumber; }
    string getAccountHolder() const { return accountHolder; }
    double getBalance() const { return balance; }

    // ✅ Encapsulation → Deposit & Withdraw with validation
    virtual void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            cout << "Deposited: " << amount << endl;
        }
    }

    virtual void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            cout << "Withdrew: " << amount << endl;
        } else {
            cout << "Insufficient balance or invalid amount.\n";
        }
    }

    // ✅ Pure virtual function → Makes class abstract
    virtual void displayAccountType() = 0;
};

// ✅ Derived class → Inheritance
class SavingsAccount : public BankAccount {
private:
    double interestRate;

public:
    SavingsAccount(string accNum, string holder, double bal, double rate)
        : BankAccount(accNum, holder, bal), interestRate(rate) {}

    void addInterest() {
        double interest = balance * interestRate / 100;
        deposit(interest);
        cout << "Interest added: " << interest << endl;
    }

    void displayAccountType() override {
        cout << "Account Type: Savings Account\n";
    }
};

// ✅ Another derived class
class CurrentAccount : public BankAccount {
private:
    double overdraftLimit;

public:
    CurrentAccount(string accNum, string holder, double bal, double limit)
        : BankAccount(accNum, holder, bal), overdraftLimit(limit) {}

    void withdraw(double amount) override {
        if (amount <= balance + overdraftLimit) {
            balance -= amount;
            cout << "Withdrew (Current): " << amount << endl;
        } else {
            cout << "Exceeds overdraft limit.\n";
        }
    }

    void displayAccountType() override {
        cout << "Account Type: Current Account\n";
    }
};

int main() {
    SavingsAccount sa("S123", "Alice", 1000.0, 5.0);
    CurrentAccount ca("C456", "Bob", 500.0, 200.0);

    BankAccount* accounts[2] = { &sa, &ca };

    for (int i = 0; i < 2; ++i) {
        accounts[i]->displayAccountType();
        accounts[i]->deposit(200);
        accounts[i]->withdraw(150);
        cout << "Balance: " << accounts[i]->getBalance() << "\n\n";
    }

    sa.addInterest();
}
