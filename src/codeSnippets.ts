export interface CodeSnippet {
  language: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    language: 'JavaScript',
    code: `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(10, 20);
console.log("Result:", result);`
  },
  {
    language: 'JavaScript',
    code: `const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};`
  },
  {
    language: 'Python',
    code: `def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Developer"))`
  },
  {
    language: 'Python',
    code: `items = [1, 2, 3, 4, 5]
squared = [x**2 for x in items]
for val in squared:
    if val > 10:
        print(val)`
  },
  {
    language: 'HTML',
    code: `<div class="container">
  <h1>Welcome to SwiftType</h1>
  <p>Practice your typing skills.</p>
  <button id="start-btn">Get Started</button>
</div>`
  },
  {
    language: 'HTML',
    code: `<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>`
  }
];
