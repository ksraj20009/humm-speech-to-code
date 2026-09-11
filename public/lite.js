(function (root) {
  function generateLite(transcript, language) {
    const t = String(transcript).toLowerCase().replace(/[\"']/g, "").replace(/[.,;:!?\-]/g, " ").replace(/\s+/g, " ").trim();
    const has = (ws) => ws.some((w) => t.includes(w));
    let key = null;
    if (has(["calculate total", "price and quantity", "price times quantity"])) key = "total";
    else if (has(["grade a", "marks greater", "list of students", "students"])) key = "grades";
    else if (has(["mumbai", "5000", "last 30 days", "customers"])) key = "mumbai";
    else if (has(["register", "user registration", "hash the password", "email already"])) key = "register";
    else if (has(["even"]) && has(["sum", "filter", "banao", "function"])) key = "evens";
    const S = {
      total: {
        python: "def calculate_total(price, quantity):\n    return price * quantity",
        javascript: "function calculateTotal(price, quantity) {\n  return price * quantity;\n}",
        java: "public int calculateTotal(int price, int quantity) {\n    return price * quantity;\n}",
        sql: "SELECT price * quantity AS total;",
        cpp: "int calculateTotal(int price, int quantity) {\n    return price * quantity;\n}",
        go: "func calculateTotal(price, quantity int) int {\n    return price * quantity\n}",
        rust: "fn calculate_total(price: i64, quantity: i64) -> i64 {\n    price * quantity\n}"
      },
      grades: {
        python: "for student in students:\n    if student.marks > 90:\n        print(\"Grade A\")\n    elif student.marks > 75:\n        print(\"Grade B\")\n    else:\n        print(\"Grade C\")",
        javascript: "for (const student of students) {\n  if (student.marks > 90) console.log(\"Grade A\");\n  else if (student.marks > 75) console.log(\"Grade B\");\n  else console.log(\"Grade C\");\n}",
        java: "for (Student student : students) {\n    if (student.marks > 90) System.out.println(\"Grade A\");\n    else if (student.marks > 75) System.out.println(\"Grade B\");\n    else System.out.println(\"Grade C\");\n}",
        sql: "SELECT name, CASE WHEN marks > 90 THEN 'Grade A' WHEN marks > 75 THEN 'Grade B' ELSE 'Grade C' END AS grade FROM students;",
        cpp: "for (const auto& s : students) { if (s.marks > 90) std::cout << \"Grade A\\n\"; }",
        go: "for _, s := range students { if s.Marks > 90 { fmt.Println(\"Grade A\") } }",
        rust: "for s in &students { if s.marks > 90 { println!(\"Grade A\"); } }"
      },
      mumbai: {
        python: "result = customers.merge(orders, left_on=\"id\", right_on=\"customer_id\").query(\"city == 'Mumbai' and amount > 5000\").sort_values(\"amount\", ascending=False)",
        javascript: "const result = customers.filter(c => c.city === \"Mumbai\");",
        java: "// Mumbai customers, orders > 5000 in last 30 days",
        sql: "SELECT c.*\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE c.city = 'Mumbai'\n  AND o.amount > 5000\n  AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\nORDER BY o.amount DESC;",
        cpp: "// Mumbai filter",
        go: "// Mumbai filter",
        rust: "// Mumbai filter"
      },
      register: {
        python: "@app.route(\"/register\", methods=[\"POST\"])\ndef register():\n    data = request.get_json()\n    if User.query.filter_by(email=data.get(\"email\")).first():\n        return jsonify({\"error\": \"Email already exists\"}), 400\n    return jsonify({\"message\": \"User registered successfully\"}), 201",
        javascript: "app.post(\"/register\", async (req, res) => {\n  const { email } = req.body;\n  if (await User.findOne({ email })) return res.status(400).json({ error: \"Email already exists\" });\n  return res.status(201).json({ message: \"User registered successfully\" });\n});",
        java: "@PostMapping(\"/register\") public ResponseEntity<?> register() { return ResponseEntity.status(201).build(); }",
        sql: "INSERT INTO users (name, email) SELECT :name, :email WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = :email);",
        cpp: "// POST /register",
        go: "func register(w http.ResponseWriter, r *http.Request) {}",
        rust: "// POST /register"
      },
      evens: {
        python: "def sum_of_even_numbers(numbers):\n    even_numbers = [n for n in numbers if n % 2 == 0]\n    return sum(even_numbers)",
        javascript: "function sumOfEvenNumbers(numbers) {\n  return numbers.filter(n => n % 2 === 0).reduce((s, n) => s + n, 0);\n}",
        java: "public int sumOfEvenNumbers(List<Integer> numbers) {\n    return numbers.stream().filter(n -> n % 2 == 0).mapToInt(Integer::intValue).sum();\n}",
        sql: "SELECT SUM(n) AS even_sum FROM numbers WHERE MOD(n, 2) = 0;",
        cpp: "int sumOfEvenNumbers(const std::vector<int>& numbers) { int total=0; for (int n: numbers) if (n%2==0) total+=n; return total; }",
        go: "func sumOfEvenNumbers(numbers []int) int { total:=0; for _, n := range numbers { if n%2==0 { total+=n } }; return total }",
        rust: "fn sum_of_even_numbers(numbers: &[i64]) -> i64 { numbers.iter().filter(|n| *n % 2 == 0).sum() }"
      }
    };
    if (key && S[key] && S[key][language]) return S[key][language];
    const safe = String(transcript).slice(0, 160);
    const stubs = {
      python: "def from_spoken_logic():\n    \"\"\"" + safe + "\"\"\"\n    pass",
      javascript: "function fromSpokenLogic() {\n  // " + safe + "\n}",
      java: "public class FromSpokenLogic {}",
      sql: "-- " + safe + "\nSELECT 1;",
      cpp: "void fromSpokenLogic() {}",
      go: "func FromSpokenLogic() {}",
      rust: "fn from_spoken_logic() {}"
    };
    return stubs[language] || stubs.python;
  }
  root.HUMM_LITE = { generateLite };
})(typeof window !== "undefined" ? window : globalThis);
