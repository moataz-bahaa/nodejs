const deleteProduct = async (e) => {
  const productId = e.target.parentElement.querySelector('[name=id]').value;
  const csrfToken = e.target.parentElement.querySelector('[name=_csrf]').value;
  const productElement = e.target.closest('article');
  try {
    const res = await fetch(`/admin/product/${productId}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrfToken,
      },
    });
    const data = await res.json();
    console.log(data);
    productElement.parentElement.removeChild(productElement);
  } catch(err) {
    console.log(err.message);
  }
};

document.querySelectorAll('.delete-product').forEach((btn) => {
  btn.addEventListener('click', deleteProduct);
});
