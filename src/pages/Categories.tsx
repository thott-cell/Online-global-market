import { categories } from "../data/categories";

interface Props {
  onChangePage: (page: string) => void;
}

const Categories = ({ onChangePage }: Props) => {

  return (
    <div className="categories-page">

      <h2>Categories</h2>

      <div className="categories-grid">

        {categories.map((cat) => (

          <div
            key={cat.name}
            className="category-card"
            onClick={() => onChangePage(`category-${cat.name}`)}
          >

            <i className={cat.icon}></i>

            <p>{cat.name}</p>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Categories;