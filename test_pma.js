fetch('http://localhost/phpmyadmin/index.php?route=/database/structure&db=appointment')
  .then(res => res.text())
  .then(html => {
    const lines = html.split('\n');
    for (let i = 1420; i < Math.min(lines.length, 1550); i++) {
      console.log(`L${i}: ${lines[i]}`);
    }
  });
