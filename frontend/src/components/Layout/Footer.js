import { Link } from "react-router-dom"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="create-account">
      
        <Link to="/register" className="btn-create-account">
          Ouvrir un compte gratuit
        </Link>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <h2>Concours CI</h2>
          <p className="footer-description">
            Concours CI est né d'une conviction forte : la réussite repose avant tout sur des choix d'orientation
            éclairés. Nous offrons une plateforme collaborative où chaque utilisateur peut enrichir notre base de
            données en ajoutant écoles, universités et concours, et en partageant ses avis. Ensemble, aidons la
            communauté à construire un parcours ambitieux et aligné avec ses aspirations.
          </p>
          <div className="social-links">
            <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <i className="linkedin-icon">in</i>
            </a>
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <i className="facebook-icon">f</i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>La plateforme</h3>
          <ul>
            <li>
              <Link to="/avis-concours">Avis sur les concours</Link>
            </li>
            <li>
              <Link to="/avis-etablissements">Avis sur les établissements</Link>
            </li>
            <li>
              <Link to="/concours">Liste concours lancés</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Une plateforme pour</h3>
          <ul>
            <li>
              <Link to="/candidats">Candidats et futurs candidats</Link>
            </li>
            <li>
              <Link to="/formateurs">Les formateurs aux concours</Link>
            </li>
            <li>
              <Link to="/organisateurs">Les organisateurs de concours</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Concours CI. Tous droits réservés</p>
      </div>
    </footer>
  )
}

export default Footer
