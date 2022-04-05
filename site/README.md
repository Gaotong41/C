## Basic manual for website editing

### Edit or add documentation pages

To edit and/or add documentation, you need to have a [GitHub](https://github.com/login) account.
To change documentation files or add a documentation page,
simply click `Edit this page` on the page you would like to edit.
If you need to add a child page, click `Create child page`.

If you need to edit the text that has the markup [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet),
click on the `Fork this repository` button.

Read how to edit files for github ([GitHub docs](https://docs.github.com/en/github/managing-files-in-a-repository/editing-files-in-another-users-repository)).

Please note that files have a markup for correct display on the site: the title, the title of the link,
the weight (affects the order of files display on the sidebar) and description (optional):

    ---
    title: "Title"
    linkTitle: "Link Title"
    weight: 1
    description: >
        Description
    ---

### Start site localy

To start the site locally, you need a recent [extended version hugo](https://github.com/gohugoio/hugo/releases)
(recommend version 0.75.0 or later).
Open the most recent release and scroll down until you find a list of Extended versions. [Read more](https://gohugo.io/getting-started/installing/#quick-install)

Add a path to "hugo" in the "Path" environment variable.

Clone a repository branch containing the site. For example, using a git command:

    git clone --branch <branchname> <remote-repo-url>

If you want to build and/or serve your site locally, you also need to get local copies of the theme's own submodules:

    git submodule update --init --recursive

To build and preview your site locally, use:

    cd <your local directory>/cvat/site/
    hugo server

By default, your site will be available at <http://localhost:1313/docs/>.

Instead of a "hugo server" command, you can use the "hugo" command that generates the site into a "public" folder.

To build or update your site's CSS resources you will need [PostCSS](https://postcss.org/) to create final assets.
To install it you must have a recent version of [NodeJS](https://nodejs.org/en/) installed on your machine,
so you can use npm, the Node package manager.
By default npm installs tools under the directory where you run [npm install](https://docs.npmjs.com/cli/v6/commands/npm-install#description):

    cd <your local directory>/cvat/site/
    npm ci

Then you can build a website in the "public" folder:

    hugo

[Read more](https://www.docsy.dev/docs/getting-started/)

### Update the submodule of the docsy theme

To update the submodule of the docsy theme you need to have a repository clone. While in the repository folder,
use the git command:

    git submodule update --remote

Add and then commit the change to project:

    git add themes/
    git commit -m "Updating theme submodule"

Push the commit to project repo. For example, run:

    git push

### Site features

#### Get CSV

You can insert a `CSV` spreadsheet in the documentation. To do this, use the shortcode:

    {{< get-csv url="<ur_or_path_to_csv_file>" sep="<sep>" >}}

You need to set the url of the csv file or the path in the repository
(note that the root in this case will be the `site` folder,
so if you want to insert the table from the directory above use `.. /..`
depending on the location of the file in which the shortcode is used).
You can also set the separator (the default is `,`).

#### Repolink

You can add a link to a file or folder in the repository
that will be bound to the documentation version using the repolink shortcode:

    {{< repolink text="<text>" path="<path_into_repository>" icon="<true>" >}}

You must specify the text that will be displayed in the documentation, you can specify the path inside the repository
(if you do not specify the path the link will lead to the root of the repository).
If you want the link to be different from other links in the documentation you can include the GitHub icon
for this add `icon="true"` (by default the icon is not displayed).
In order to set a link to a folder, the path must end with `/`
The repository link is specified by the `github_repo` parameter in the `config.toml` file.
