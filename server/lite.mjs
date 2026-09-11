const SNIPPETS = {
  total: {
    python: `def calculate_total(price, quantity):\n    return price * quantity`,
    javascript: `function calculateTotal(price, quantity) {\n  return price * quantity;\n}`,
    java: `public int calculateTotal(int price, int quantity) {\n    return price * quantity;\n}`,
    sql: `SELECT price * quantity AS total;`,
    cpp: `int calculateTotal(int price, int quantity) {\n    return price * quantity;\n}`,
    go: `func calculateTotal(price, quantity int) int {\n    return price * quantity\n}`,
    rust: `fn calculate_total(price: i64, quantity: i64) -> i64 {\n    price * quantity\n}`
  },
  grades: {
    python: `for student in students:\n    if student.marks > 90:\n        print("Grade A")\n    elif student.marks > 75:\n        print("Grade B")\n    else:\n        print("Grade C")`,
    javascript: `for (const student of students) {\n  if (student.marks > 90) console.log("Grade A");\n  else if (student.marks > 75) console.log("Grade B");\n  else console.log("Grade C");\n}`,
    java: `for (Student student : students) {\n    if (student.marks > 90) System.out.println("Grade A");\n    else if (student.marks > 75) System.out.println("Grade B");\n    else System.out.println("Grade C");\n}`,
    sql: `SELECT name, CASE WHEN marks > 90 THEN 'Grade A' WHEN marks > 75 THEN 'Grade B' ELSE 'Grade C' END AS grade FROM students;`,
    cpp: `for (const auto& s : students) {\n    if (s.marks > 90) std::cout << "Grade A\\n";\n    else if (s.marks > 75) std::cout << "Grade B\\n";\n    else std::cout << "Grade C\\n";\n}`,
    go: `for _, s := range students {\n    if s.Marks > 90 { fmt.Println("Grade A") } else if s.Marks > 75 { fmt.Println("Grade B") } else { fmt.Println("Grade C") }\n}`,
    rust: `for s in &students {\n    if s.marks > 90 { println!("Grade A"); } else if s.marks > 75 { println!("Grade B"); } else { println!("Grade C"); }\n}`
  },
  mumbai: {
    python: `from datetime import datetime, timedelta\ncutoff = datetime.now() - timedelta(days=30)\nresult = (customers.merge(orders, left_on="id", right_on="customer_id")\n    .query("city == 'Mumbai' and amount > 5000 and order_date >= @cutoff")\n    .sort_values("amount", ascending=False))`,
    javascript: `const cutoff = Date.now() - 30*24*60*60*1000;\nconst result = customers.filter(c => c.city === "Mumbai")\n  .flatMap(c => orders.filter(o => o.customer_id === c.id && o.amount > 5000 && new Date(o.order_date) >= cutoff))\n  .sort((a,b) => b.amount - a.amount);`,
    java: `// Mumbai customers, orders > 5000 in last 30 days, highest first`,
    sql: `SELECT c.*\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE c.city = 'Mumbai'\n  AND o.amount > 5000\n  AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\nORDER BY o.amount DESC;`,
    cpp: `// Filter Mumbai customers with orders > 5000 in last 30 days.`,
    go: `sort.Slice(result, func(i, j int) bool { return result[i].Amount > result[j].Amount })`,
    rust: `result.sort_by(|a, b| b.amount.cmp(&a.amount));`
  },
  register: {
    python: `from flask import request, jsonify\nimport bcrypt\n\n@app.route("/register", methods=["POST"])\ndef register():\n    data = request.get_json()\n    name, email, password = data.get("name"), data.get("email"), data.get("password")\n    if User.query.filter_by(email=email).first():\n        return jsonify({"error": "Email already exists"}), 400\n    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())\n    db.session.add(User(name=name, email=email, password=hashed_pw))\n    db.session.commit()\n    return jsonify({"message": "User registered successfully"}), 201`,
    javascript: `app.post("/register", async (req, res) => {\n  const { name, email, password } = req.body;\n  if (await User.findOne({ email })) return res.status(400).json({ error: "Email already exists" });\n  await User.create({ name, email, password: await bcrypt.hash(password, 10) });\n  return res.status(201).json({ message: "User registered successfully" });\n});`,
    java: `@PostMapping("/register")\npublic ResponseEntity<?> register(@RequestBody RegisterRequest req) {\n    if (userRepository.findByEmail(req.email()).isPresent()) return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));\n    userRepository.save(new User(req.name(), req.email(), passwordEncoder.encode(req.password())));\n    return ResponseEntity.status(201).body(Map.of("message", "User registered successfully"));\n}`,
    sql: `INSERT INTO users (name, email, password_hash)\nSELECT :name, :email, :password_hash\nWHERE NOT EXISTS (SELECT 1 FROM users WHERE email = :email);`,
    cpp: `// POST /register`,
    go: `func register(w http.ResponseWriter, r *http.Request) {}`,
    rust: `// POST /register`
  },
  evens: {
    python: `def sum_of_even_numbers(numbers):\n    even_numbers = [n for n in numbers if n % 2 == 0]\n    return sum(even_numbers)`,
    javascript: `function sumOfEvenNumbers(numbers) {\n  return numbers.filter(n => n % 2 === 0).reduce((s, n) => s + n, 0);\n}`,
    java: `public int sumOfEvenNumbers(List<Integer> numbers) {\n    return numbers.stream().filter(n -> n % 2 == 0).mapToInt(Integer::intValue).sum();\n}`,
    sql: `SELECT SUM(n) AS even_sum FROM numbers WHERE MOD(n, 2) = 0;`,
    cpp: `int sumOfEvenNumbers(const std::vector<int>& numbers) {\n    int total = 0; for (int n : numbers) if (n % 2 == 0) total += n; return total;\n}`,
    go: `func sumOfEvenNumbers(numbers []int) int {\n    total := 0\n    for _, n := range numbers { if n%2 == 0 { total += n } }\n    return total\n}`,
    rust: `fn sum_of_even_numbers(numbers: &[i64]) -> i64 {\n    numbers.iter().filter(|n| *n % 2 == 0).sum()\n}`
  }
};

function norm(s) {
  return String(s).toLowerCase().replace(/[\u201c\u201d"']/g, "").replace(/[.,;:!?\-]/g, " ").replace(/\s+/g, " ").trim();
}
function hasAny(t, words) { return words.some((w) => t.includes(w)); }
function pickKey(t) {
  if (hasAny(t, ["calculate total", "price and quantity", "price times quantity"])) return "total";
  if (hasAny(t, ["grade a", "marks greater", "list of students", "students"])) return "grades";
  if (hasAny(t, ["mumbai", "5000", "last 30 days", "customers"])) return "mumbai";
  if (hasAny(t, ["register", "user registration", "hash the password", "email already"])) return "register";
  if (hasAny(t, ["even"]) && hasAny(t, ["sum", "filter", "banao", "function"])) return "evens";
  return null;
}
export function generateLite(transcript, language) {
  const key = pickKey(norm(transcript));
  if (key && SNIPPETS[key] && SNIPPETS[key][language]) return SNIPPETS[key][language];
  const safe = String(transcript).replace(/\*\//g, "").slice(0, 200);
  const stubs = {
    python: `def from_spoken_logic(*args, **kwargs):\n    """HUMM Lite sketch from: ${safe}"""\n    raise NotImplementedError("Connect a model in Model settings for full generation.")`,
    javascript: `function fromSpokenLogic(...args) {\n  throw new Error("Connect a model in Model settings for full generation.");\n}`,
    java: `public class FromSpokenLogic { /* ${safe} */ }`,
    sql: `-- ${safe}\nSELECT 1;`,
    cpp: `void fromSpokenLogic() {}`,
    go: `func FromSpokenLogic() {}`,
    rust: `fn from_spoken_logic() {}`
  };
  return stubs[language] || stubs.python;
}
export function stripFences(raw) {
  let text = String(raw || "").trim();
  if (text.startsWith("```")) text = text.replace(/^```[a-zA-Z0-9+\-_.]*\n?/, "").replace(/\n?```$/, "");
  return text.trim();
}
export const LANGUAGES = ["python", "javascript", "java", "sql", "cpp", "go", "rust"];
export const PROVIDERS = ["humm-lite", "anthropic", "gemini", "openai-compatible", "custom"];
export const SYSTEM_PROMPT = `You are HUMM Speech-to-Code.\nTreat input as spoken code logic (English, Hindi, Hinglish, mixed). Ignore filler.\nReturn ONLY paste-ready source code for the requested language. No markdown fences. No explanation.`;
