import { Link } from "react-router-dom"
import "./BusinessHome.css"

const BusinessHome = () => {
  return (
    <div className="business-home">
      

      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Concours CI, pour des concours
            <br />
            Transparents et sécurisés
          </h1>
          <div className="hero-cta">
            <Link to="/business/register" className="btn-cta">
              Créer un Compte Business gratuitement
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-title">
          <h2>Pourquoi organiser son concours sur Concours CI ?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle green">
                <span className="icon">✓</span>
              </div>
            </div>
            <h3>Vérifications automatique des diplômes</h3>
            <p>
              Nous avons des API pour intérroger des bases de données sur l'authenticité ou l'origine des diplômes. Cela
              vous évite les fraudes sur les diplômes et vous passez moins de dans sur la vérification des candidatures
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle gray">
                <span className="icon">👁️</span>
              </div>
            </div>
            <h3>Anonymisation des candidatures</h3>
            <p>
              Une fois les dossiers des candidats vérifiés et validés, les candidatures sont anonymisés pur assurer la
              transparence dans la suite du processus
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle green">
                <span className="icon">🔄</span>
              </div>
            </div>
            <h3>Traçabilité des actions</h3>
            <p>
              Toutes les opérations sur les dossiers des candidats sont tracées. Vous pouvez accéder à l'historique des
              consultations et modifications
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle dark">
                <span className="icon">🔒</span>
              </div>
            </div>
            <h3>Sécurité des données</h3>
            <p>
              Nous mettons un accent particulier sur la sécurité des données de nos utilisateurs. Nous y travaillons
              tous les jours pour assurer un niveau de sécurité élevé
            </p>
          </div>
        </div>
      </section>

      <section className="preparation-section">
        <div className="section-title">
          <h2>Pourquoi vous inscrire sur Concours CI pour vos cours de préparation aux concours ?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle green">
                <span className="icon">🔍</span>
              </div>
            </div>
            <h3>Augmentez votre Visibilité</h3>
            <p>
              - Accédez à des milliers de candidats actifs, prêts à investir dans leur préparation.
              <br />- Gagnez en visibilité auprès des utilisateurs recherchant des formations spécifiques.
              <br />- Bénéficiez d'un espace dédié pour promouvoir vos services et vos succès.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle orange">
                <span className="icon">📊</span>
              </div>
            </div>
            <h3>Tout-en-un pour optimiser vos services</h3>
            <p>
              - Publiez facilement votre offre de formation directement dans la page d'information du concours
              <br />- Gérez les inscriptions des candidats en quelques clics.
              <br />- Utilisez des outils analytiques pour suivre l'efficacité de vos campagnes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle green">
                <span className="icon">🔄</span>
              </div>
            </div>
            <h3>Traçabilité des actions</h3>
            <p>
              Toutes les opérations sur les dossiers des candidats sont tracées. Vous pouvez accéder à l'historique des
              consultations et modifications
            </p>
          </div>
        </div>
      </section>

      <section className="user-types-section">
        <div className="user-types-grid">
          <div className="user-type-card">
            <div className="user-type-image">
              <img src="/images/organisateurs.jpg" alt="Organisateurs de concours" />
            </div>
            <div className="user-type-content">
              <h3>Oragnisateurs</h3>
              <p>Gérer toutes les étapes de votre concours ici et créer de la confiance</p>
            </div>
          </div>

          <div className="user-type-card">
            <div className="user-type-image">
              <img src="/images/formateurs.jpg" alt="Formateurs" />
            </div>
            <div className="user-type-content">
              <h3>Formateurs</h3>
              <p>Accéder directement à votre public cible</p>
            </div>
          </div>

          <div className="user-type-card">
            <div className="user-type-image">
              <img src="/images/vendeurs.jpg" alt="Vendeurs" />
            </div>
            <div className="user-type-content">
              <h3>Vendeurs</h3>
              <p>Vos fascicules sont exposés au maximum à vos clients cibles</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à rejoindre Concours CI Business ?</h2>
          <p>Créez votre compte gratuitement et commencez à gérer vos concours, formations ou ventes de documents.</p>
          <Link to="/business/register" className="btn-cta">
            Créer un compte Business maintenant
          </Link>
        </div>
      </section>
    </div>
  )
}

export default BusinessHome

